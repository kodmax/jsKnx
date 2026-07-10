import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'
import { KnxConnection } from './KnxConnection'
import { DataPointAbstract } from '@repo/knx-dpts'
import { KnxCemiFrame } from '@repo/knx-common'
import {
    KnxEventEmitter,
    type KnxEventMap,
    type KnxEventName,
    type KnxLinkConstructorOptions,
    type LinkInfo,
    type RequiredKnxLinkOptions
} from '@repo/knx-common'
import { KnxGroupSchema } from './types'

type KnxEventListener<K extends KnxEventName<KnxCemiFrame>> = (arg: KnxEventMap<KnxCemiFrame>[K]) => void

const NO_ERROR_LISTENER_WARNING = 'js-knx: KnxLink has no error listener. Call knx.on("error", …) before connect(), or unhandled errors will crash the process.'

export class KnxLink {
    private readonly events = new KnxEventEmitter<KnxCemiFrame>()
    private readonly connection: KnxConnection
    private readonly options: RequiredKnxLinkOptions

    /**
     * Create a KNX/IP tunnel link to a gateway.
     *
     * All `options` fields are optional. Defaults applied when omitted:
     *
     * | Option | Default |
     * | --- | --- |
     * | `maxTelegramsPerSecond` | `24` |
     * | `maxConcurrentMessages` | `16` |
     * | `readTimeout` | `10000` |
     * | `connectionTimeout` | `10000` |
     * | `maxRetry` | `Infinity` |
     * | `retryPause` | `3000` |
     * | `autoReconnect` | `true` |
     * | `port` | `3671` |
     */
    public constructor(ip: string, options: KnxLinkConstructorOptions = {}) {
        this.options = {
            maxTelegramsPerSecond: 24,
            maxConcurrentMessages: 16,
            readTimeout: 10000,

            connectionTimeout: 10000,
            maxRetry: +Infinity,
            retryPause: 3000,
            autoReconnect: true,

            port: 3671,

            ...options
        }

        this.connection = new KnxConnection(this.options, ip, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, this.events)
    }

    /**
     * Register a listener for a link event.
     *
     * Events:
     *
     * | Event | Payload |
     * | --- | --- |
     * | `error` | `KnxLinkException` |
     * | `cemi-frame` | `KnxCemiFrame` |
     * | `connecting` | `{ ip, port }` |
     * | `network-connection-established` | `{ ip, port }` |
     * | `starting-session` | `{ ip, port }` |
     * | `connected` | `LinkInfo` |
     * | `reconnecting` | `{ delayMs }` |
     * | `disconnected` | `{ reason }` |
     */
    public on<K extends KnxEventName<KnxCemiFrame>>(eventName: K, listener: KnxEventListener<K>): this {
        this.events.on(eventName, listener)

        return this
    }

    /** Remove a listener previously registered with {@link on} or {@link once}. */
    public off<K extends KnxEventName<KnxCemiFrame>>(eventName: K, listener: KnxEventListener<K>): this {
        this.events.off(eventName, listener)

        return this
    }

    /** Register a one-shot listener; it is removed automatically after the first invocation. */
    public once<K extends KnxEventName<KnxCemiFrame>>(eventName: K, listener: KnxEventListener<K>): this {
        this.events.once(eventName, listener)

        return this
    }

    /** Emit an event to registered listeners. Returns `true` when at least one listener handled it. */
    public emit<K extends KnxEventName<KnxCemiFrame>>(eventName: K, arg: KnxEventMap<KnxCemiFrame>[K]): boolean {
        return this.events.emit(eventName, arg)
    }

    /**
     * Open a KNX/IP tunnel to the gateway.
     *
     * Register an `error` listener with {@link on} before calling this method; otherwise
     * unhandled errors may crash the process and a console warning is printed.
     *
     * Retries with `maxRetry` / `retryPause` when the gateway rejects the connection.
     * Throws `CONNECTION_ALREADY_ESTABLISHED` or `CONNECTION_IN_PROGRESS` on a second call.
     */
    public async connect(): Promise<KnxLink> {
        if (this.events.listenerCount('error') === 0) {
            console.warn(NO_ERROR_LISTENER_WARNING)
        }

        await this.connection.connect()
        return this
    }

    /**
     * Return metadata about the active tunnel session.
     *
     * @throws `NO_CONNECTION` when {@link connect} has not completed successfully.
     */
    public getLinkInfo(): LinkInfo {
        return this.connection.getLinkInfo()
    }

    /**
     * Send a raw CEMI frame through the tunnel.
     *
     * Prefer typed group operations via {@link group} for normal read/write traffic.
     *
     * @throws `NO_CONNECTION` when the tunnel is not established.
     */
    public async sendCemiFrame(cemiFrame: Buffer): Promise<void> {
        return this.connection.sendCemiFrame(cemiFrame)
    }

    /**
     * Gracefully close the KNX/IP tunnel.
     *
     * @remarks
     * Call this on process shutdown (e.g. `SIGINT`, `SIGTERM`) so the gateway
     * releases the tunnel channel. Exiting without disconnecting can leave KNX
     * channels occupied until the gateway times them out.
     *
     * Does not trigger automatic reconnect. Throws `NO_CONNECTION` when not connected.
     */
    public async disconnect(): Promise<void> {
        return this.connection.disconnect()
    }

    /**
     * Create a typed client for a group address on this link.
     *
     * @template T DPT class from `schema.DataType` (e.g. `DPT_Switch`).
     * @param schema Group address and DPT class from the schema definition.
     * @param init Optional callback invoked on the new instance before it is returned.
     * @returns An instance of `T` bound to `schema.address`. Use `read()`, `write()`,
     *          and DPT-specific helpers (e.g. `on()` / `off()` on `DPT_Switch`).
     */
    public group<T extends DataPointAbstract<unknown>>({ address, DataType }: KnxGroupSchema<T>, init?: (dataPoint: T) => void): T {
        const dataPoint = new DataType(address, this, this.options)

        if (init) {
            init(dataPoint)
        }

        return dataPoint
    }
}
