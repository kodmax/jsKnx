import { DataPointAbstract } from './data-point-abstract'
import { KnxReading } from '../../types'

export function fromBuffer (buf: Buffer): number {
    return buf.readUint8(0) & 0x01
}

export function toBuffer (value: number, buf: Buffer): Buffer {
    buf.writeUint8((value & 0x01) === 1 ? 0x1 : 0x0, 0)
    return buf
}

export abstract class B1 extends DataPointAbstract<number> {
    protected valueByteLength: number = 1

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
            return (value & 0x01).toString(2)
        }
    }
}
