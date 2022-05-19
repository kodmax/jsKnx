import * as fs from "fs"
import { KnxConnection } from "./connection"
import { Knx } from "./knx"
import { KnxSchemaDeclaration } from "./types"

export class KnxSchema {
    public static async load(path: string): Promise<KnxSchema> {
        return new KnxSchema(JSON.parse(await fs.promises.readFile(path, { encoding: 'utf-8' })))
    }

    private constructor(private readonly schema: KnxSchemaDeclaration) {

    }

    public async connect(ip?: string, port?: number): Promise<Knx> {
        const targetPort: number = port || this.schema.port || 3671
        const targetIp: string = ip || this.schema.ip || ''
        
        if (targetIp) {
            const connection = await KnxConnection.bind(targetIp, targetPort)
            const channel = await connection.connect()

            return new Knx(this.schema, channel, connection.getTunnel(), connection.getGateway())
    
        } else {
            throw new Error("No IP speciefied for the schema")
        }
    }
}