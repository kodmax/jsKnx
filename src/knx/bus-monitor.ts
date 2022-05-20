import { Socket } from "dgram"
import { KnxConnection } from "./connection"
import { KnxConnectionType, KnxLayer, KnxServiceId } from "./enums"
import { KnxIpMessage, KnxMessage } from "./message"
import { KnxSchema } from "./schema"

export class BusMonitor {
    private constructor(private readonly KnxConnection: KnxConnection) {
        //
    }

    static async connect(ip: string, port: number, cb: (msg: KnxMessage) => void): Promise<BusMonitor> {
        const connection = await KnxConnection.bind(ip, port)
        const tunnel = connection.getTunnel()
    
        await connection.connect(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.BUSMONITOR_LAYER)
        tunnel.on('message', msg => {
            const ipMessage = KnxIpMessage.decode(msg)
            if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST) {
                KnxIpMessage.compose(KnxServiceId.TUNNEL_RESPONSE, [Buffer.from([0x04, ipMessage.getChannel(), ipMessage.getSequenceNumber(), 0x00])]).send(tunnel)
                if (ipMessage.hasCemiFrame()) {
                    cb(ipMessage.getCemiFrame())
                }
            } 
        })

        return new BusMonitor(connection)
    }
}
