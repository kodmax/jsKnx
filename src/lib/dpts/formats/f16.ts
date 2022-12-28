import { KnxReading } from '../../types'
import { DataPointAbstract } from './data-point-abstract'

export function fromBuffer (buf: Buffer): number {
    const value = buf.readUint16BE(1)
    const e = (value >> 11) & 0x0f
    const m = value & 0x07ff
    const s = value & 0x8000

    return 0.01 * m * 2 ** e * (s ? -1 : 1)
}

export function toBuffer (value: number, buf: Buffer): Buffer {
    let m = Math.abs(value * 100)
    const s = value < 0 ? 1 : 0
    let e = 0

    while (m > 0x07ff) {
        m /= 2
        e++
    }

    if (e > 15) {
        throw new Error('Float16: Value Out of Range: ' + value)
    }

    buf.writeUint16BE((s << 15) + (e << 11) + m, 1)
    return buf
}

export abstract class F16 extends DataPointAbstract<number> {

    protected decode (data: Buffer): number {
        return fromBuffer(data)
    }

    public async write (value: number): Promise<void> {
        return this.send(toBuffer(value, Buffer.alloc(3)))
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
