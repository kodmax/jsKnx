import { KnxConnection } from "./connection"
import { KnxConnectionType, KnxLayer, KnxMessageCode, KnxServiceId } from "../enums"
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
                tunneling.ack(tunnel)
                
                if ([KnxMessageCode ["L_Data.ind"]].includes(tunneling.getMessageCode())) {
                    const cemiFrame = new KnxCemiFrame(ipMessage.getBody(16))
                    cb(cemiFrame)                
                    
                }
            } 
        })

        return new BusMonitor(connection)
    }
}
