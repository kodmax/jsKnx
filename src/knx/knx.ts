import { DataPointAbstract } from "./formats/types";
import { KnxIp } from "./knx-ip";


export class Knx {
    public constructor(private readonly knxIp: KnxIp) {

    }

    public getDataPoint<T extends DataPointAbstract>(address: string, DataPointType: new(address: string, knxIp: KnxIp) => T): T {
        return new DataPointType(address, this.knxIp)
    }
}