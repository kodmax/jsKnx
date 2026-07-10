import { DataPointAbstract } from '../DataPointAbstract'
import { KnxReading } from '@repo/knx-common'
import * as codec from './codec'

export abstract class B1 extends DataPointAbstract<number> {
    protected valueByteLength: number = 1

    public static fromBuffer = codec.fromBuffer
    public static toBuffer = codec.toBuffer

    protected decode(data: Buffer): number {
        return codec.fromBuffer(data)
    }

    /** Send a group write with a numeric value (DPT-specific encoding). */
    public async write(value: number): Promise<void> {
        return this.send(codec.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }

    /** Remove a listener previously added with {@link addValueListener}. */
    public removeValueListener(cb: (reading: KnxReading<number>) => void) {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    /** Subscribe to incoming group writes and read responses for this address. */
    public addValueListener(cb: (reading: KnxReading<number>) => void) {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return (value & 0x01).toString(2)
        }
    }
}
