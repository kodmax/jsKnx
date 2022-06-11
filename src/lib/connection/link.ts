
import { KnxIpMessage, TunnelingRequest, KnxCemiFrame } from "../message"
import { KnxConnectionType, KnxLayer, KnxCemiCode, KnxServiceId, APCI } from "../enums"
import { KnxConnection, KnxLinkInfo } from "./connection"
import { IDPT } from "../dpts/formats"

import EventEmitter from "events"
import { DataPointAbstract } from "../dpts/formats/data-point-abstract"
import { KnxLinkOptions } from "../types"

export class KnxLink {
    public constructor(private linkInfo: KnxLinkInfo, private readonly connection: KnxConnection, private readonly options: Required<KnxLinkOptions>) {
        const gateway = connection.getGateway()
        gateway.on("message", data => {
            const ipMessage = KnxIpMessage.decode(data)
            if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_REQUEST) {
                connection.connect(this.linkInfo.connectionType, this.linkInfo.layer).then(linkInfo => {
                    this.linkInfo = linkInfo
                })

            } else if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_RESPONSE) {
                //
            }
        })

        const tunnel = connection.getTunnel()
        tunnel.on("message", msg => {
            const ipMessage = KnxIpMessage.decode(msg)
            if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST) {
                const tunneling = new TunnelingRequest(ipMessage.getBody())
                tunneling.ack(tunnel)

                if ([KnxCemiCode.L_Data_Indication].includes(tunneling.getCemiCode())) {
                    const cemiFrame = new KnxCemiFrame(tunneling.getBody())
                    this.options.events.emit("cemi-frame", cemiFrame)
                }
            }
        })
    }

    public static async connect(ip: string, { port = 3671, readTimeout = 3000, events = new EventEmitter }: KnxLinkOptions = {}): Promise<KnxLink> {
        const connection = await KnxConnection.bind(ip, port)

        return new KnxLink(await connection.connect(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER), connection, { port, readTimeout, events })
    }

    public getLinkInfo(): KnxLinkInfo {
        return Object.assign({}, this.linkInfo)
    }

    public async disconnect(): Promise<void> {
        return this.connection.disconnect(this.linkInfo.channel)
    }

    public async close(): Promise<void> {
        return this.connection.close()
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
