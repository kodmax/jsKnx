import { DataPointAbstract } from '../DataPointAbstract'
import { KnxReading } from '@js-knx-internal/types'
import * as codec from './codec'

export abstract class B8 extends DataPointAbstract<number[]> {
    protected valueByteLength: number = 2

    public static fromBuffer = codec.fromBuffer
    public static toBuffer = codec.toBuffer

    protected decode(data: Buffer): number[] {
        return codec.fromBuffer(data)
    }

    public async write(bits: number[]): Promise<void> {
        return this.send(codec.toBuffer(bits, Buffer.alloc(this.valueByteLength)))
    }

    public removeValueListener(cb: (reading: KnxReading<number[]>) => void) {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public addValueListener(cb: (reading: KnxReading<number[]>) => void) {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString(bits?: number[]): string {
        if (bits === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return `[${bits.join('')}]`
        }
    }
}
