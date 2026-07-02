import { KnxConnectionType, KnxLayer } from '../../../enums'
import { KnxLinkOptions, LinkInfo } from './connect'
import { retry } from './retry'
import { KnxLinkException } from '../../../types'
import { KnxSession } from './connect/KnxSession'
import { KnxTransport } from './connect/KnxTransport'

const DISCONNECT_RESPONSE_TIMEOUT_MS = 30_000

/**
 * Docs
 * http://www.eb-systeme.de/?page_id=479
 */
export class KnxConnection {
    private transport?: KnxTransport
    private session?: KnxSession
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

    private emitError(error: unknown): void {
        if (this.options.events.listenerCount('error') > 0) {
            this.options.events.emit('error', error as KnxLinkException)
        }
    }

    public async connect(): Promise<void> {
        if (this.session) {
            throw new KnxLinkException('CONNECTION_ALREADY_ESTABLISHED', 'Connection is already established', {})
        }

        if (this.connecting) {
            throw new KnxLinkException('CONNECTION_IN_PROGRESS', 'Connection is already in progress', {})
        }

        this.clearReconnectTimeout()
        this.explicitDisconnect = false
        this.connecting = true

        try {
            this.transport = await KnxTransport.open(this.ip, this.options.port)

            this.transport.onClose(() => {
                this.handleSocketClose()
            })

            await retry(this.options.maxRetry, this.options.retryPause, async () => {
                try {
                    this.session = await KnxSession.startSession(this.transport!, this.options, this.connectionType, this.layer, cemiFrame =>
                        this.options.events.emit('cemi-frame', cemiFrame)
                    )
                    this.connecting = false

                    this.session.onDisconnectRequest(() => {
                        this.teardown()
                        if (!this.explicitDisconnect) {
                            this.scheduleReconnect()
                        }
                    })

                    this.session.onDisconnectResponse(() => {
                        this.teardown()
                    })
                } catch (e) {
                    this.emitError(e)
                    throw e
                }
            })
        } catch (e) {
            if (this.transport === undefined) {
                this.emitError(e)
            }

            this.teardown()
            throw e
        }
    }

    async sendCemiFrame(cemiFrame: Buffer): Promise<void> {
        if (this.session === undefined) {
            throw new KnxLinkException('NO_CONNECTION', 'Gateway connection not established', {})
        }

        return this.session.sendCemiFrame(cemiFrame)
    }

    public getLinkInfo(): LinkInfo {
        if (this.session === undefined) {
            throw new KnxLinkException('NO_CONNECTION', 'Gateway connection not established', {})
        }

        return this.session.getLinkInfo()
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
                // ignore — connect errors surface via options.events from KnxConnection
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

    private teardown(): void {
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

        this.session = undefined
        this.transport?.close()
        this.transport = undefined
        this.connecting = false
        this.tearingDown = false
    }

    /**
     * Gracefully close the knx gateway connection
     */
    public async disconnect(): Promise<void> {
        if (this.session === undefined) {
            throw new KnxLinkException('NO_CONNECTION', 'Gateway connection not established', {})
        }

        this.explicitDisconnect = true
        this.clearReconnectTimeout()

        this.session.requestDisconnect()

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
}
