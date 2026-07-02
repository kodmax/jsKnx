import { KnxIpMessage, hpai } from '../../message'
import { KnxConnectionType, KnxLayer, KnxServiceId } from '../../enums'
import connect, { InternalLinkInfo, KnxLinkOptions } from './connect'

import { Socket } from 'dgram'
import { retry } from '../retry'
import { KnxLinkException, knxNetworkError } from '../../types'
import { connectSockets } from './connect/connect-sockets'
import { ConnectionSockets } from './LinkInfo'

const DISCONNECT_RESPONSE_TIMEOUT_MS = 30_000

/**
 * Docs
 * http://www.eb-systeme.de/?page_id=479
 */
export class KnxConnection {
    private linkInfo?: InternalLinkInfo
    private connecting: boolean = false
    private explicitDisconnect: boolean = false
    private tearingDown: boolean = false
    private disconnectTimeoutId?: ReturnType<typeof setTimeout>
    private reconnectTimeoutId?: ReturnType<typeof setTimeout>
    private pendingDisconnectResolve?: () => void

    public constructor(
        private readonly options: KnxLinkOptions,
        private readonly ip: string,
        private readonly connectionType: KnxConnectionType,
        private readonly layer: KnxLayer
    ) {}

    public async connect(): Promise<void> {
        if (this.linkInfo) {
            throw new KnxLinkException('CONNECTION_ALREADY_ESTABLISHED', 'Connection is already established', {})
        }

        if (this.connecting) {
            throw new KnxLinkException('CONNECTION_IN_PROGRESS', 'Connection is already in progress', {})
        }

        this.clearReconnectTimeout()
        this.explicitDisconnect = false
        this.connecting = true

        let sockets: ConnectionSockets | undefined

        try {
            const [gateway, tunnel] = await connectSockets(this.ip, this.options.port)
            sockets = { gateway, tunnel }

            await retry(this.options.maxRetry, this.options.retryPause, async () => {
                this.linkInfo = await connect(this.options, gateway, tunnel, this.connectionType, this.layer)
                this.connecting = false

                this.linkInfo.gateway.once('close', () => {
                    this.handleSocketClose()
                })

                this.linkInfo.tunnel.once('close', () => {
                    this.handleSocketClose()
                })

                this.linkInfo.gateway.on('message', data => {
                    const ipMessage = KnxIpMessage.decode(data)

                    // Gateway initiated disconnect (device requests session teardown)
                    if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_REQUEST) {
                        this.teardown()
                        if (!this.explicitDisconnect) {
                            this.scheduleReconnect()
                        }
                    } else if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_RESPONSE) {
                        this.teardown()
                    }
                })
            })
        } catch (e) {
            this.teardown(sockets)
            throw e
        }
    }

    public getLinkInfo(): InternalLinkInfo {
        if (this.linkInfo) {
            return this.linkInfo
        } else {
            throw new KnxLinkException('NO_CONNECTION', 'Gateway connection not established', {})
        }
    }

    private clearReconnectTimeout(): void {
        if (this.reconnectTimeoutId !== undefined) {
            clearTimeout(this.reconnectTimeoutId)
            this.reconnectTimeoutId = undefined
        }
    }

    private scheduleReconnect(): void {
        if (this.explicitDisconnect || this.reconnectTimeoutId !== undefined) {
            return
        }

        this.reconnectTimeoutId = setTimeout(() => {
            this.reconnectTimeoutId = undefined
            this.connect().catch(() => {
                // ignore — connect errors surface via options.events from connect helper
            })
        }, this.options.retryPause)
    }

    private handleSocketClose(): void {
        if (this.tearingDown) {
            return
        }

        this.teardown()
        if (!this.explicitDisconnect) {
            this.scheduleReconnect()
        }
    }

    private teardown(sockets?: ConnectionSockets): void {
        if (this.tearingDown) {
            return
        }

        this.tearingDown = true
        this.clearReconnectTimeout()

        if (this.disconnectTimeoutId !== undefined) {
            clearTimeout(this.disconnectTimeoutId)
            this.disconnectTimeoutId = undefined
        }

        if (this.pendingDisconnectResolve !== undefined) {
            const resolve = this.pendingDisconnectResolve
            this.pendingDisconnectResolve = undefined
            resolve()
        }

        if (sockets !== undefined) {
            this.terminate(sockets)
        } else if (this.linkInfo !== undefined) {
            this.terminate(this.linkInfo)
        }

        this.linkInfo = undefined
        this.connecting = false
        this.tearingDown = false
    }

    private terminate(sockets: ConnectionSockets): void {
        try {
            sockets.gateway.close()
        } catch {
            // ignore
        }

        try {
            sockets.tunnel.close()
        } catch {
            // ignore
        }
    }

    /**
     * Gracefully close the knx gateway connection
     */
    public async disconnect(): Promise<void> {
        if (this.linkInfo === undefined) {
            throw new KnxLinkException('NO_CONNECTION', 'Gateway connection not established', {})
        }

        this.explicitDisconnect = true
        this.clearReconnectTimeout()

        await this.sendTo(
            this.linkInfo.gateway,
            KnxIpMessage.compose(KnxServiceId.DISCONNECT_REQUEST, [Buffer.from([this.linkInfo.channel, 0x00]), hpai(this.linkInfo.gateway.address())])
        )

        return new Promise(resolve => {
            this.pendingDisconnectResolve = resolve

            this.disconnectTimeoutId = setTimeout(() => {
                this.disconnectTimeoutId = undefined
                this.pendingDisconnectResolve = undefined
                this.teardown()
                resolve()
            }, DISCONNECT_RESPONSE_TIMEOUT_MS)
        })
    }

    private async sendTo(socket: Socket, message: KnxIpMessage): Promise<void> {
        return new Promise((resolve, reject) => {
            socket.send(message.getBuffer(), error => {
                if (error) {
                    this.teardown()
                    if (!this.explicitDisconnect) {
                        this.scheduleReconnect()
                    }
                    reject(knxNetworkError(error))
                } else {
                    resolve()
                }
            })
        })
    }
}
