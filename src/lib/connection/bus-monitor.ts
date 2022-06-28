import { KnxConnection } from "./connection"
import { KnxConnectionType, KnxLayer, KnxCemiCode, KnxServiceId } from "../enums"
import { KnxIpMessage, TunnelingRequest, KnxCemiFrame } from "../message"

export class BusMonitor {
    private constructor(private readonly KnxConnection: KnxConnection) {
        //
    }

    static async connect(ip: string, port: number, cb: (msg: KnxCemiFrame) => void): Promise<BusMonitor> {
        const connection = await KnxConnection.bind(ip, port)
        const tunnel = connection.getTunnel()
    
        await connection.connect(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.BUSMONITOR_LAYER)
        tunnel.on("message", msg => {
            const ipMessage = KnxIpMessage.decode(msg)

            if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST) {
                const tunneling = new TunnelingRequest(ipMessage.getBody())
                connection.send(tunneling.ack())
                
                if ([KnxCemiCode.L_Busmon_Indication].includes(tunneling.getCemiCode())) {
                    const cemiFrame = new KnxCemiFrame(tunneling.getBody(12))
                    cb(cemiFrame)                
                    
                }
            } 
        })

        return new BusMonitor(connection)
    }
}
