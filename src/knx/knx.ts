import { IDPT } from "./types";

import { KnxIpMessage } from "./message";
import { KnxConnectionType, KnxLayer, KnxMessageCode, KnxServiceId } from "./enums";

import { KnxConnection } from "./connection";
import { KnxCemiFrame } from "./message/cemi-frame";
import EventEmitter from "events";


export class Knx {
    private events: EventEmitter = new EventEmitter()

    public constructor(private readonly channel: number, private readonly connection: KnxConnection) {
        const tunnel = connection.getTunnel()

        tunnel.on('message', msg => {
            const ipMessage = KnxIpMessage.decode(msg)
            if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST && msg.length > 8 && ipMessage.getBody(4).readUint8(0) === KnxMessageCode ['L_Data.ind'] && ipMessage.getBody(8).length >= 11) {
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

    public getGroup<T extends IDPT>(address: string, DataPointType: new(connection: KnxConnection, address: string, events: EventEmitter) => T, init?: (dataPoint: T) => void): T {
        const dataPoint = new DataPointType(this.connection, address, this.events)
        
        if (init) {
            init(dataPoint)
        }

        return dataPoint
    }
}