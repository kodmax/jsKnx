import { KnxLinkException, KnxReading } from '../../types'
import { DataPointAbstract } from './data-point-abstract'

export function fromBuffer (buf: Buffer): number {
    const f16 = buf.readUint16BE(1)
    const s = (f16 & 0x8000)

    const m = s ? (f16 & 0x07ff) - 0x0800 : (f16 & 0x07ff)
    const e = 1 << ((f16 >> 11) & 0x0f)

    return m * e * 0.01
}

export function toBuffer (value: number, buf: Buffer): Buffer {
    const s = value < 0 ? 1 : 0
    value = Math.abs(value)

    let m = Math.abs(value * 100)
    let e = 0

    while (m > 0x07ff) {
        m /= 2
        e++
    }

    if (e > 15) {
        throw new KnxLinkException('INVALID_VALUE', 'Float16: Value Out of Range: ' + value, {
            value
        })
    }

    buf.writeUint16BE((s << 15) + (e << 11) + Math.round(s ? 2048 - m : m), 1)
    return buf
}

export abstract class F16 extends DataPointAbstract<number> {
    protected valueByteLength: number = 3

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
