
import { KnxIpMessage, TunnelingRequest, KnxCemiFrame } from "../message"
import { KnxConnectionType, KnxLayer, KnxCemiCode, KnxServiceId, APCI } from "../enums"
import { KnxConnection, KnxLinkInfo } from "./connection"
import { IDPT } from "../dpts/formats"

import EventEmitter from "events"


export class KnxLink {
    private events: EventEmitter = new EventEmitter()

    public constructor(private linkInfo: KnxLinkInfo, private readonly connection: KnxConnection) {
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
                    this.events.emit("cemi-frame", cemiFrame)
                }
            }
        })
    }

    public static async connect(ip: string, port = 3671): Promise<KnxLink> {
        const connection = await KnxConnection.bind(ip, port)

        return new KnxLink(await connection.connect(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER), connection)
    }

    public getLinkInfo(): KnxLinkInfo {
        return Object.assign({}, this.linkInfo)
    }

    public async disconnect(): Promise<void> {
        return this.connection.disconnect(this.linkInfo.channel)
    }

    public group<T extends IDPT>(address: string, DataPointType: new(address: string, connection: KnxConnection, link: KnxLink, events?: EventEmitter) => T, init?: (dataPoint: T) => void): T {
        const dataPoint = new DataPointType(address, this.connection, this, this.events)

        if (init) {
            init(dataPoint)
        }

        return dataPoint
    }

    public groupFromSchema<T>({ address, dataType }: KnxGroupSchema<T>, init?: (dataPoint: T) => void): T {
        const dataPoint = new dataType(address, this.connection, this, this.events)

        if (init) {
            init(dataPoint)
        }

        return dataPoint
    }
}

export type KnxGroupSchema<T> = {
    dataType: new(address: string, connection: KnxConnection, link: KnxLink, events?: EventEmitter) => T,
    address: string
}
