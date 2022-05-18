import { DataPointAbstract } from "./formats/types";
import { KnxSchema } from "./schema";
import { KnxIp } from "./knx-ip";
import * as fs from "fs"

export class Knx {
    public constructor(private readonly knxIp: KnxIp) {

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

    public getDataPoint<T extends DataPointAbstract>(groups: string[], DataPointType: new(addresses: string[], knxIp: KnxIp) => T): T {
        return new DataPointType(groups, this.knxIp)
    }
}