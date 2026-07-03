import { KnxReading } from '@js-knx-internal/types'
import { DataPointAbstract } from '../DataPointAbstract'
import * as codec from './codec'

export abstract class Date extends DataPointAbstract<string> {
    protected valueByteLength: number = 4

    protected decode(data: Buffer): string {
        const [d, m, y] = codec.fromBuffer(data)

        return `${y.toString(10)}-${m.toString(10).padStart(2, '0')}-${d.toString(10).padStart(2, '0')}`
    }

    public async write(value: string): Promise<void> {
        return this.send(codec.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }

    public removeValueListener(cb: (reading: KnxReading<string>) => void) {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public addValueListener(cb: (reading: KnxReading<string>) => void) {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString(value?: string): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value
        }
    }
}
