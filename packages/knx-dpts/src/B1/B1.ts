import { DataPointAbstract } from '../DataPointAbstract'
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

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return (value & 0x01).toString(2)
        }
    }
}
