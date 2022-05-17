import { KnxIp } from "../knx-ip"

export interface DataPointBinary<T> {
    toBuffer(value: T, buf: Buffer, position?: number): void
    fromBuffer(buf: Buffer, position?: number): T
}

export interface DataPoint<T> {
    on(cb: (value: T) => Promise<void>): void
    write(value: T): Promise<void>
    ping(): Promise<void>
    read(): Promise<T>
}

export abstract class DataPointAbstract {
    public constructor(protected readonly address: string, protected readonly knxIp: KnxIp) {

    }
}