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

}