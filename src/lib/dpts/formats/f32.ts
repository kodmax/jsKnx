import { KnxReading } from "../../types"
import { DataPointAbstract } from "./data-point-abstract"

export function fromBuffer(buf: Buffer): number {
    return buf.readFloatBE(1)
}

export function  toBuffer(value: number, buf: Buffer, position = 0): Buffer {
    buf.writeFloatBE(value, 1)
    return buf
}

export abstract class F32 extends DataPointAbstract<number> {

    protected decode(data: Buffer): number {
        return fromBuffer(data)
    }

    public async write(value: number): Promise<void> {
        return this.send(toBuffer(value, Buffer.alloc(5)))
    }

    public removeValueListener(cb: (reading: KnxReading<number>) => void) {
        this.valueEvent.removeListener("value-received", cb)
        this.updateSubscription("value-received")
    }

    public addValueListener(cb: (reading: KnxReading<number>) => void) {
        this.valueEvent.addListener("value-received", cb)
        this.updateSubscription("value-received")
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return `${Number(value).toFixed(0)} ${this.unit}`
        }
    }
}

