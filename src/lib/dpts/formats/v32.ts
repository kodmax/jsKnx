import { DataPointAbstract } from "./data-point-abstract"

export function fromBuffer(buf: Buffer, position = 0): number {
    return buf.readInt32BE(1)
}

export function toBuffer(value: number, buf: Buffer): Buffer {
    buf.writeInt32BE(value, 1)
    buf.writeUint8(0x80, 0)
    return buf
}

export abstract class V32 extends DataPointAbstract<number> {

    protected decode(data: Buffer): number {
        return fromBuffer(data)
    }

    public async write(value: number): Promise<void> {
        return this.send(toBuffer(value, Buffer.alloc(5)))
    }

    public removeValueListener(cb: (value: number, unit: string, source: string) => void) {
        this.valueEvent.removeListener("value", cb)
        this.updateSubscription("value")
    }

    public addValueListener(cb: (value: number, unit: string, source: string) => void) {
        this.valueEvent.addListener("value", cb)
        this.updateSubscription("value")
    }
}

