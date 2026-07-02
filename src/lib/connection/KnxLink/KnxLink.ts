import { KnxConnectionType, KnxLayer } from '../../enums'
import { KnxConnection } from './KnxConnection'
import { IDPT } from '../../dpts/formats'

import { KnxEventEmitter, KnxEventMap, KnxEventName } from './KnxEventEmitter'
import { KnxGroupSchema, KnxLinkConnectOptions, LinkInfo, RequiredKnxLinkOptions } from './types'

type KnxEventListener<K extends KnxEventName> = (arg: KnxEventMap[K]) => void

export class KnxLink {
    private readonly events: KnxEventEmitter

    public constructor(
        private readonly connection: KnxConnection,
        private readonly options: RequiredKnxLinkOptions,
        events: KnxEventEmitter
    ) {
        this.events = events
    }

    public on<K extends KnxEventName>(eventName: K, listener: KnxEventListener<K>): this {
        this.events.on(eventName, listener)

        return this
    }

    public off<K extends KnxEventName>(eventName: K, listener: KnxEventListener<K>): this {
        this.events.off(eventName, listener)

        return this
    }

    public once<K extends KnxEventName>(eventName: K, listener: KnxEventListener<K>): this {
        this.events.once(eventName, listener)

        return this
    }

    public emit<K extends KnxEventName>(eventName: K, arg: KnxEventMap[K]): boolean {
        return this.events.emit(eventName, arg)
    }

    public static async connect(ip: string, options: KnxLinkConnectOptions): Promise<KnxLink> {
        const { onError, onCemiFrame, ...optionValues } = options
        const opts: RequiredKnxLinkOptions = {
            maxTelegramsPerSecond: 24,
            maxConcurrentMessages: 16,
            readTimeout: 10000,

            connectionTimeout: 10000,
            maxRetry: +Infinity,
            retryPause: 3000,

            port: 3671,

            ...optionValues
        }

        const events = new KnxEventEmitter()
        const connection = new KnxConnection(opts, ip, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, events)
        const link = new KnxLink(connection, opts, events)

        link.on('error', onError)
        link.on('cemi-frame', onCemiFrame)

        await connection.connect()

        return link
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
