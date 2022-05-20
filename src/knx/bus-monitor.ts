import { KnxConnection } from "./connection"
import { KnxConnectionType, KnxLayer, KnxServiceId } from "./enums"
import { KnxIpMessage } from "./message"
import { KnxCemiFrame } from "./message/cemi-frame"

export class BusMonitor {
    private constructor(private readonly KnxConnection: KnxConnection) {
        //
    }

    static async connect(ip: string, port: number, cb: (msg: KnxCemiFrame) => void): Promise<BusMonitor> {
        const connection = await KnxConnection.bind(ip, port)
        const tunnel = connection.getTunnel()
    
        await connection.connect(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.BUSMONITOR_LAYER)
        tunnel.on('message', msg => {
            const ipMessage = KnxIpMessage.decode(msg)

            if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST && msg.length > 22) {
                const cemiFrame = new KnxCemiFrame(ipMessage.getBody(16))
                cemiFrame.ack(tunnel)
                cb(cemiFrame)                
            } 
        })

        return new BusMonitor(connection)
    }
}
