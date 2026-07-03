import { KnxReading } from '@repo/knx-common'
import { DataPointAbstract } from '../DataPointAbstract'
import * as codec from './codec'
import { KnxDateTime } from './types'

export abstract class DateTime extends DataPointAbstract<KnxDateTime> {
    protected valueByteLength: number = 9

    protected decode(data: Buffer): KnxDateTime {
        return codec.fromBuffer(data)
    }

    public async write(value: KnxDateTime): Promise<void> {
        return this.send(codec.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }

    public removeValueListener(cb: (reading: KnxReading<KnxDateTime>) => void) {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public addValueListener(cb: (reading: KnxReading<KnxDateTime>) => void) {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString(value?: KnxDateTime): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            const dayOfMonth = Number(value.dayOfMonth).toString().padStart(2, '0')
            const month = Number(value.month).toString().padStart(2, '0')
            const year = value.year

            const hourOfDay = Number(value.hourOfDay).toString().padStart(2, '0')
            const minutes = Number(value.minutes).toString().padStart(2, '0')
            const seconds = Number(value.seconds).toString().padStart(2, '0')

            return `${year}-${month}-${dayOfMonth} ${hourOfDay}:${minutes}:${seconds}`
        }
    }
}
