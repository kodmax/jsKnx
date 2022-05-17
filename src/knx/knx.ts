import { DataPointAbstract } from "./formats/types";
import { KnxIp } from "./knx-ip";


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

    public getDataPoint<T extends DataPointAbstract>(groups: string[], DataPointType: new(addresses: string[], knxIp: KnxIp) => T): T {
        return new DataPointType(groups, this.knxIp)
    }
}