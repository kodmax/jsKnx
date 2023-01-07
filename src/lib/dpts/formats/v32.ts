import { DataPointAbstract } from './data-point-abstract'
import { KnxReading } from '../../types'

export function fromBuffer (buf: Buffer): number {
    return buf.readInt32BE(1)
}

export function toBuffer (value: number, buf: Buffer): Buffer {
    buf.writeInt32BE(value, 1)
    return buf
}

export abstract class V32 extends DataPointAbstract<number> {
    protected valueByteLength: number = 5

    protected decode (data: Buffer): number {
        return fromBuffer(data)
    }

    public async write (value: number): Promise<void> {
        return this.send(toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }

    public removeValueListener (cb: (reading: KnxReading<number>) => void) {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public addValueListener (cb: (reading: KnxReading<number>) => void) {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString (value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return `${Number(value).toFixed(0)} ${this.unit}`
        }
    }
}
