import { KnxSchemaDeclaration, IKnxGateway } from "./types";
import { IDPT } from "./datapoint-types/types";
import { IPGateway } from "./ip-gateway";

import { Socket, createSocket } from "dgram";
import * as fs from "fs"


export class KnxFunction {
    public constructor(private readonly functionName: string, private readonly locationName: string, private readonly knx: Knx) {

    }

    public async scanComponent<T extends IDPT>(name: string, type: new(addresses: string[], gateway: IKnxGateway) => T): Promise<T> {
        return this.knx.getDataPoint<T>(await this.knx.scanComponent(name, this.functionName, this.locationName), type)
    }
}
export class Knx {
    public static async connect(path: string, ip?: string, port?: number): Promise<Knx> {
        const schema = JSON.parse(await fs.promises.readFile(path, { encoding: 'utf-8' }))

        const targetPort: number = port || schema.port || 3671
        const targetIp: string = ip || schema.ip || ''
        if (targetIp) {
            const socket: Socket = createSocket('udp4')
            socket.connect(targetPort, targetIp)

            return new Knx(new IPGateway(socket), schema)
    
        } else {
            throw new Error("No IP speciefied for the schema")
        }
    }

    private constructor(private readonly gateway: IKnxGateway, schema: KnxSchemaDeclaration) {

    }

    /**
     * 
     * @param address device address
     * @param pin device input/output number
     * @returns 
     */
    public async scanGroups(address: string, pin: number): Promise<string[]> {
        return [address]
    }

    public async scanComponentByUid(uid: string): Promise<string[]> {
        return ['']
    }

    public async scanComponent(componentName: string, functionName: string, locationName: string): Promise<string[]> {
        return ['']
    }

    public async getFunction(functionName: string, locationName: string): Promise<KnxFunction> {
        return new KnxFunction(functionName, locationName, this)
    }

    public getDataPoint<T extends IDPT>(groups: string[], DataPointType: new(addresses: string[], gateway: IKnxGateway) => T): T {
        return new DataPointType(groups, this.gateway)
    }
}