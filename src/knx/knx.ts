import { KnxSchemaDeclaration } from "./types";
import { IDPT } from "./types";

import { Socket } from "dgram";
import { KnxIpMessage } from "./message";
import { KnxConnectionType, KnxLayer, KnxServiceId } from "./enums";
import { KnxGroup } from "./group";
import { KnxConnection } from "./connection";
import { EventEmitter } from "stream";
import { Vent } from "./vent";


export class Knx {
    private events: Vent<KnxIpMessage> = new Vent<KnxIpMessage>()

    public constructor(private readonly channel: number, private readonly connection: KnxConnection) {
        const tunnel = connection.getTunnel()

        tunnel.on('message', msg => {
            const ipMessage = KnxIpMessage.decode(msg)
            if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST) {
                KnxIpMessage.compose(KnxServiceId.TUNNEL_RESPONSE, [Buffer.from([0x04, ipMessage.getChannel(), ipMessage.getSequenceNumber(), 0x00])]).send(tunnel)
                this.events.trigger('tunnel-request', ipMessage)
            } 
        })
    }

    public static async connect(ip: string, port: number = 3671): Promise<Knx> {
        const connection = await KnxConnection.bind(ip, port)

        return new Knx(await connection.connect(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER), connection)
    }


    public group<T extends IDPT>(address: string, label?: string): KnxGroup<T> {
        return new KnxGroup<T>(address, this.events, label)
    }


    public getDataPoint<T extends IDPT>(groups: string[], DataPointType: new(addresses: string[], bus: Socket) => T): T {
        return new DataPointType(groups, this.connection.getTunnel())
    }
}