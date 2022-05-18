import { DataPointAbstract } from "../formats/types";
import { Knx } from "../knx";
import { KnxIp } from "../knx-ip";

export class KnxFunction {
    public constructor(private readonly functionName: string, private readonly locationName: string, private readonly knx: Knx, private readonly knxIp: KnxIp) {

    }

    public async scanComponent<T extends DataPointAbstract>(name: string, type: new(addresses: string[], knxIp: KnxIp) => T): Promise<T> {
        return this.knx.getDataPoint<T>(await this.knx.scanComponent(name, this.functionName, this.locationName), type)
    }
}