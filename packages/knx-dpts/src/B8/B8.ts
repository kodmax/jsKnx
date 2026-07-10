import { DataPointAbstract } from '../DataPointAbstract'
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

    public toString(bits?: number[]): string {
        if (bits === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return `[${bits.join('')}]`
        }
    }
}
