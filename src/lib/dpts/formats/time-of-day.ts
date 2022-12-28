import { DataPointAbstract } from './data-point-abstract'
import { KnxReading } from '../../types'

export enum DayOfWeek {
    '' = 0,
    Mon = 1,
    Tue = 2,
    Wed = 3,
    Thu = 4,
    Fri = 5,
    Sat = 6,
    Sun = 7
}

export function fromBuffer (data: Buffer): number[] {
    const d = (data.readUint8(1) & 0xe0) >> 5
    const h = data.readUint8(1) & 0x1f
    const m = data.readUint8(2)
    const s = data.readUint8(3)

    return [d, h, m, s]
}

const pattern = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun) )?(2[0-4]|[01]?[0-9]):([0-5]?[0-9])(?::([0-5]?[0-9]))?$/
export function toBuffer (value: string, data: Buffer): Buffer {
    const match = value.match(pattern)
    if (match) {
        const [, d, h, m, s] = match
        
        const dayNumber = DayOfWeek[(d ?? '') as keyof typeof DayOfWeek]
        data.writeUint8((dayNumber << 5) + +h, 1)
        
        data.writeUint8(+m, 2)
        data.writeUint8(+s || 0, 3)

        return data

    } else {
        throw new Error('Invalid TimeOfDay string: ' + value)
    }
}

export abstract class TimeOfDay extends DataPointAbstract<string> {

    protected decode (data: Buffer): string {
        const [d, h, m, s] = fromBuffer(data)

        return `${d ? DayOfWeek[d] + ' ' : ''}${h.toString(10).padStart(2, '0')}:${m.toString(10).padStart(2, '0')}:${s.toString(10).padStart(2, '0')}`
    }

    public async write (value: string): Promise<void> {
        return this.send(toBuffer(value, Buffer.alloc(4)))
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
