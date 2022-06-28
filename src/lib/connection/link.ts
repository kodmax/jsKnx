
import { KnxIpMessage, TunnelingRequest, KnxCemiFrame } from "../message"
import { KnxConnectionType, KnxLayer, KnxCemiCode, KnxServiceId, APCI } from "../enums"
import { KnxConnection } from "./connection"
import { IDPT } from "../dpts/formats"

import EventEmitter from "events"
import { DataPointAbstract } from "../dpts/formats/data-point-abstract"
import { KnxLinkOptions } from "../types"
import { KnxLinkInfo } from "./connect"

const defaults: Required<Omit<KnxLinkOptions, "events">> = { port: 3671, readTimeout: 3000, retryPause: 3000, maxRetry: +Infinity, connectionTimeout: 5000 }
export class KnxLink {
    public constructor(private readonly connection: KnxConnection, private readonly options: Required<KnxLinkOptions>) {

    }

    public static async connect(ip: string, options: KnxLinkOptions = {}): Promise<KnxLink> {
        const opts: Required<KnxLinkOptions> = { ...defaults, ...{ events: new EventEmitter }, ...options }
        const connection = new KnxConnection(opts, ip, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)
        await connection.connect()

        return new KnxLink(connection, opts)
    }

    public getLinkInfo(): KnxLinkInfo {
        return Object.assign({}, this.connection.getLinkInfo())
    }

    public async disconnect(): Promise<void> {
        return this.connection.disconnect()
    }

    public getDatapoint<T extends IDPT>({ address, dataType }: KnxGroupSchema<T>, init?: (dataPoint: T) => void): T {
        const dataPoint = new dataType(address, this.connection, this, this.options)

        if (init) {
            init(dataPoint)
        }

        return dataPoint
    }
}

export type KnxGroupSchema<T> = {
    dataType: new(...args: ConstructorParameters<typeof DataPointAbstract>) => T,
    address: string
}
