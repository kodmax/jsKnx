import { KnxSchemaDeclaration } from "./schema"
import { KnxFunction } from "./function"
import { KnxIp } from "../knx-ip"
import { Knx } from "../knx"

export { KnxSchemaDeclaration } from "./schema"

export class KnxSchema {
    public constructor(private readonly schema: KnxSchemaDeclaration, private readonly knx: Knx, private readonly knxIp: KnxIp) {

    }

    public async getFunction(functionName: string, locationName: string): Promise<KnxFunction> {
        return new KnxFunction(functionName, locationName, this.knx, this.knxIp)
    }

}