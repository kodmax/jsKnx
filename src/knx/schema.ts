import * as fs from "fs"
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

    public getPort(): number {
        return this.port
    }

    public getIp(): string {
        return this.ip
    }

    public getGroupName(address: string): string {
        return this.schema.groups [address]?.name
    }
}