import { KnxIp } from "../knx-ip"

export interface DataPoint<T> {
    on(eventType: string, cb: (value: T) => Promise<void>): void
    write(value: T): Promise<void>
    ping(): Promise<void>
    read(): Promise<T>
}

export abstract class DataPointAbstract {
    public constructor(protected readonly addresses: string[], protected readonly knx: KnxIp) {
        if (addresses.length === 0) {
            throw new Error("At least one DataPoint address must be specified")
        }
    }
}