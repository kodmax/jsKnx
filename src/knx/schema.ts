import * as fs from "fs"
import { KnxConnection } from "./connection"
import { KnxConnectionType, KnxLayer, KnxServiceId } from "./enums"
import { Knx } from "./knx"
import { KnxIpMessage, KnxMessage, cri } from "./message"
import { KnxSchemaDeclaration } from "./types"

export class KnxSchema {
    private readonly port: number
    private readonly ip: string

    public static async load(path: string, ip?: string, port?: number): Promise<KnxSchema> {
        return new KnxSchema(JSON.parse(await fs.promises.readFile(path, { encoding: 'utf-8' })), ip, port)
    }

    private constructor(private readonly schema: KnxSchemaDeclaration, ip?: string, port?: number) {
        this.port = port || this.schema.port || 3671
        this.ip = ip || this.schema.ip || ''
    }

    public async busMonitor(cb: (msg: KnxMessage) => void): Promise<KnxSchema> {
        if (this.ip) {
            const connection = await KnxConnection.bind(this.ip, this.port)
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
    
            return this
    
        } else {
            throw new Error("No IP speciefied for the schema")
        }
    }

    public async connect(): Promise<Knx> {
        if (this.ip) {
            const connection = await KnxConnection.bind(this.ip, this.port)

            const channel = await connection.connect(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)
            return new Knx(this.schema, channel, connection.getTunnel(), connection.getGateway())
    
        } else {
            throw new Error("No IP speciefied for the schema")
        }
    }
}