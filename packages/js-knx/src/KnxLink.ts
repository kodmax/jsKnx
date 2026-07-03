import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'
import { KnxConnection } from './KnxConnection'
import { IDPT } from '@repo/knx-dpts'
import { KnxCemiFrame } from '@repo/knx-message'
import { KnxEventEmitter, type KnxEventMap, type KnxEventName } from '@repo/knx-common'
import { KnxGroupSchema, KnxLinkConstructorOptions, LinkInfo, RequiredKnxLinkOptions } from './types'

type KnxEventListener<K extends KnxEventName<KnxCemiFrame>> = (arg: KnxEventMap<KnxCemiFrame>[K]) => void

const NO_ERROR_LISTENER_WARNING = 'js-knx: KnxLink has no error listener. Call knx.on("error", …) before connect(), or unhandled errors will crash the process.'

export class KnxLink {
    private readonly events = new KnxEventEmitter<KnxCemiFrame>()
    private readonly connection: KnxConnection
    private readonly options: RequiredKnxLinkOptions

    public constructor(ip: string, options: KnxLinkConstructorOptions = {}) {
        this.options = {
            maxTelegramsPerSecond: 24,
            maxConcurrentMessages: 16,
            readTimeout: 10000,

            connectionTimeout: 10000,
            maxRetry: +Infinity,
            retryPause: 3000,

            port: 3671,

            ...options
        }

        this.connection = new KnxConnection(this.options, ip, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, this.events)
    }

    public on<K extends KnxEventName<KnxCemiFrame>>(eventName: K, listener: KnxEventListener<K>): this {
        this.events.on(eventName, listener)

        return this
    }

    public off<K extends KnxEventName<KnxCemiFrame>>(eventName: K, listener: KnxEventListener<K>): this {
        this.events.off(eventName, listener)

        return this
    }

    public once<K extends KnxEventName<KnxCemiFrame>>(eventName: K, listener: KnxEventListener<K>): this {
        this.events.once(eventName, listener)

        return this
    }

    public emit<K extends KnxEventName<KnxCemiFrame>>(eventName: K, arg: KnxEventMap<KnxCemiFrame>[K]): boolean {
        return this.events.emit(eventName, arg)
    }

    public async connect(): Promise<void> {
        if (this.events.listenerCount('error') === 0) {
            console.warn(NO_ERROR_LISTENER_WARNING)
        }

        return this.connection.connect()
    }

    public getLinkInfo(): LinkInfo {
        return this.connection.getLinkInfo()
    }

    public async sendCemiFrame(cemiFrame: Buffer): Promise<void> {
        return this.connection.sendCemiFrame(cemiFrame)
    }

    public async disconnect(): Promise<void> {
        return this.connection.disconnect()
    }

    public getDatapoint<T extends IDPT>({ address, DataType }: KnxGroupSchema<T>, init?: (dataPoint: T) => void): T {
        const dataPoint = new DataType(address, this, this.options)

        if (init) {
            init(dataPoint)
        }

        return dataPoint
    }
}
