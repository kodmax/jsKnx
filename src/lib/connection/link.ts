
import { KnxConnectionType, KnxLayer } from '../enums'
import { KnxConnection } from './connection'
import { IDPT } from '../dpts/formats'

import EventEmitter from 'events'
import { DataPointAbstract } from '../dpts/formats/data-point-abstract'
import { LinkInfo } from './LinkInfo'
import { KnxLinkOptions } from './LinkOptions'

export type KnxGroupSchema<T> = {
    DataType: new(...args: ConstructorParameters<typeof DataPointAbstract>) => T
    address: string
}

export class KnxLink {
    public constructor (private readonly connection: KnxConnection, private readonly options: Required<KnxLinkOptions>) {

    }

    public static async connect (ip: string, options: Partial<KnxLinkOptions> = {}): Promise<KnxLink> {
        const opts: KnxLinkOptions = {
            events: new EventEmitter(),

            maxTelegramsPerSecond: 50,
            maxConcurrentMessages: 16,
            connectionTimeout: 5000,
            readTimeout: 3000,
            retryPause: 3000,
            maxRetry: 31,
            port: 3671,

            ...options
        }

        const connection = new KnxConnection(opts, ip, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)
        await connection.connect()

        return new KnxLink(connection, opts)
    }

    public getLinkInfo (): LinkInfo {
        const linkInfo = this.connection.getLinkInfo()

        return {
            connectionType: linkInfo.connectionType,
            gatewayAddress: linkInfo.gatewayAddress,
            channel: linkInfo.channel,
            layer: linkInfo.layer,
            port: linkInfo.port,
            ip: linkInfo.ip
        }
    }

    public async sendCemiFrame (cemiFrame: Buffer): Promise<void> {
        return this.connection.getLinkInfo().sendCemiFrame(cemiFrame)
    }

    public async disconnect (): Promise<void> {
        return this.connection.disconnect()
    }

    public getDatapoint<T extends IDPT> ({ address, DataType }: KnxGroupSchema<T>, init?: (dataPoint: T) => void): T {
        const dataPoint = new DataType(address, this.connection, this, this.options)

        if (init) {
            init(dataPoint)
        }

        return dataPoint
    }
}
