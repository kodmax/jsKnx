import { DataPointAbstract } from '../DataPointAbstract'
import { DayOfWeek } from './DayOfWeek'
import * as codec from './codec'

export abstract class TimeOfDay extends DataPointAbstract<string> {
    protected valueByteLength: number = 4

    protected decode(data: Buffer): string {
        const [d, h, m, s] = codec.fromBuffer(data)

        return `${d ? DayOfWeek[d] + ' ' : ''}${h.toString(10).padStart(2, '0')}:${m.toString(10).padStart(2, '0')}:${s.toString(10).padStart(2, '0')}`
    }

    public async write(value: string): Promise<void> {
        return this.send(codec.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }

    public toString(value?: string): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value
        }
    }
}
