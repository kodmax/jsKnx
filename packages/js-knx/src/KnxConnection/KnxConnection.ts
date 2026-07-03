import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'
import { RequiredKnxLinkOptions, LinkInfo, KnxDisconnectedReason } from '../types'
import { retry } from './retry'
import { KnxLinkException } from '@repo/knx-common'
import { KnxSession } from './connect/KnxSession'
import { KnxTransport } from './connect/KnxTransport'
import { KnxCemiFrame } from '@repo/knx-message'
import { KnxEventEmitter } from '@repo/knx-common'

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
    private ignoreSocketClose: boolean = false
    private disconnectTimeoutId?: ReturnType<typeof setTimeout>
    private reconnectTimeoutId?: ReturnType<typeof setTimeout>
    private pendingDisconnectResolve?: () => void

    public constructor(
        private readonly options: RequiredKnxLinkOptions,
        private readonly ip: string,
        private readonly connectionType: KnxConnectionType,
        private readonly layer: KnxLayer,
        private readonly events: KnxEventEmitter<KnxCemiFrame>
    ) {}

    public async connect(): Promise<void> {
        if (this.session) {
            throw new KnxLinkException('CONNECTION_ALREADY_ESTABLISHED', 'Connection is already established', {})
        }

        if (this.connecting) {
            throw new KnxLinkException('CONNECTION_IN_PROGRESS', 'Connection is already in progress', {})
        }

        const endpoint = { ip: this.ip, port: this.options.port }

        this.clearReconnectTimeout()
        this.explicitDisconnect = false
        this.connecting = true
        this.events.emit('connecting', endpoint)

        try {
            this.ignoreSocketClose = false
            this.transport = await KnxTransport.open(this.ip, this.options.port)
            this.events.emit('network-connection-established', endpoint)

            this.transport.onClose(() => {
                this.handleSocketClose()
            })

            await retry(this.options.maxRetry, this.options.retryPause, async () => {
                try {
                    this.events.emit('starting-session', endpoint)
                    this.session = await KnxSession.startSession(this.transport!, this.options, this.connectionType, this.layer, cemiFrame =>
                        this.events.emit('cemi-frame', cemiFrame)
                    )
                    this.session.onDisconnectRequest(() => {
                        this.teardown('gateway-request')
                        if (!this.explicitDisconnect) {
                            this.scheduleReconnect()
                        }
                    })

                    this.session.onDisconnectResponse(() => {
                        this.teardown('graceful')
                    })

                    this.events.emit('connected', this.session.getLinkInfo())
                    this.connecting = false
                } catch (e) {
                    // Non-fatal: part of the retry loop (e.g. NO_MORE_CHANNELS). emit('error') throw is caught by retry().
                    // on('error') is optional here — only for logging/metrics.
                    this.events.emit('error', e as KnxLinkException)
                    throw e
                }
            })
        } catch (e) {
            if (this.transport === undefined) {
                // Fatal: UDP transport failed to open. Without on('error'), emit throws and connect() rejects —
                // uncaught rejection crashes the process unless the caller catches connect().
                this.events.emit('error', e as KnxLinkException)
            }

            this.teardown('network-connect-failed')
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

        this.events.emit('reconnecting', { delayMs: this.options.retryPause })

        this.reconnectTimeoutId = setTimeout(() => {
            this.reconnectTimeoutId = undefined
            this.connect().catch(() => {
                // ignore — connect errors surface via link error events
            })
        }, this.options.retryPause)
    }

    private handleSocketClose(): void {
        if (this.tearingDown || this.ignoreSocketClose) {
            return
        }

        this.teardown('unexpected-socket-close')
        if (!this.explicitDisconnect) {
            this.scheduleReconnect()
        }
    }

    private teardown(reason: KnxDisconnectedReason): void {
        if (this.tearingDown) {
            return
        }

        this.tearingDown = true
        this.ignoreSocketClose = true
        this.events.emit('disconnected', { reason })
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
                this.teardown('disconnect-timeout')
                resolve()
            }, DISCONNECT_RESPONSE_TIMEOUT_MS)
        })
    }
}
