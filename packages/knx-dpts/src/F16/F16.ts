import { KnxReading } from '@js-knx-internal/types'
import { DataPointAbstract } from '../DataPointAbstract'
import * as codec from './codec'

export abstract class F16 extends DataPointAbstract<number> {
    protected valueByteLength: number = 3

    protected decode(data: Buffer): number {
        return codec.fromBuffer(data)
    }

    public async write(value: number): Promise<void> {
        return this.send(codec.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }

    public removeValueListener(cb: (reading: KnxReading<number>) => void) {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public addValueListener(cb: (reading: KnxReading<number>) => void) {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return this.unit ? `${Number(value).toFixed(2)} ${this.unit}` : Number(value).toFixed(2)
        }
    }
}
