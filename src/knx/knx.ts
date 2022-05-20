import { IDPT } from "./types";

import { Socket } from "dgram";
import { KnxIpMessage } from "./message";
import { KnxConnectionType, KnxLayer, KnxServiceId } from "./enums";
import { KnxGroup } from "./group";
import { KnxConnection } from "./connection";
import { KnxCemiFrame } from "./message/cemi-frame";
import EventEmitter from "events";


export class Knx {
    private events: EventEmitter = new EventEmitter()

    public constructor(private readonly channel: number, private readonly connection: KnxConnection) {
        const tunnel = connection.getTunnel()

        tunnel.on('message', msg => {
            const ipMessage = KnxIpMessage.decode(msg)
            if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST && msg.length > 6) {
                const cemiFrame = new KnxCemiFrame(ipMessage.getBody(4))
                this.events.emit('tunnel-request', cemiFrame)
                cemiFrame.ack(tunnel)
            } 
        })
    }

    public static async connect(ip: string, port: number = 3671): Promise<Knx> {
        const connection = await KnxConnection.bind(ip, port)

        return new Knx(await connection.connect(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER), connection)
    }

    public group<T extends IDPT>(address: string, label?: string): KnxGroup<T> {
        return new KnxGroup<T>(address, this.events)
    }

    public getDataPoint<T extends IDPT>(groups: string[], DataPointType: new(addresses: string[], bus: Socket) => T): T {
        return new DataPointType(groups, this.connection.getTunnel())
    }
}