import { KnxLinkException, KnxReading } from '../../types'
import { DataPointAbstract } from './data-point-abstract'

export function fromBuffer (data: Buffer): number[] {
    const d = data.readUint8(1)
    const m = data.readUint8(2)
    const y = data.readUint8(3)

    return [d, m, y >= 90 ? 1900 + y : 2000 + y]
}
const pattern = /^(\d\d\d\d)-(\d\d)-(\d\d)$/

export function toBuffer (value: string, data: Buffer): Buffer {
    const match = value.match(pattern)
    if (match) {
        const [, y, m, d] = match

        data.writeUint8(+d, 1)
        data.writeUint8(+m, 2)

        const yy = +y
        if (yy >= 2000 && yy < 2090) {
            data.writeUint8(yy - 2000, 3)

        } else if (yy >= 1990 && yy < 2000) {
            data.writeUint8(yy - 1900, 3)

        } else {
            throw new KnxLinkException('INVALID_VALUE', 'Invalid Date Year: ' + y, {
                value: y
            })
        }

        return data

    } else {
        throw new KnxLinkException('INVALID_VALUE', 'Invalid Date string: ' + value, {
            value
        })
    }
}

export abstract class Date extends DataPointAbstract<string> {
    protected valueByteLength: number = 4

    protected decode (data: Buffer): string {
        const [d, m, y] = fromBuffer(data)

        return `${y.toString(10)}-${m.toString(10).padStart(2, '0')}-${d.toString(10).padStart(2, '0')}`
    }

    public async write (value: string): Promise<void> {
        return this.send(toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }

    public removeValueListener (cb: (reading: KnxReading<string>) => void) {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public addValueListener (cb: (reading: KnxReading<string>) => void) {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString (value?: string): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return value
        }
    }
}
