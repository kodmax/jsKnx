import { DataPointAbstract } from '../DataPointAbstract'
import * as codec from './codec'

export abstract class U8 extends DataPointAbstract<number> {
    protected valueByteLength: number = 2

    public static fromBuffer = codec.fromBuffer
    public static toBuffer = codec.toBuffer

    protected decode(data: Buffer): number {
        return codec.fromBuffer(data)
    }

    public async write(value: number): Promise<void> {
        return this.send(codec.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return this.unit ? `${Number(value).toFixed(0)} ${this.unit}` : Number(value).toFixed(0)
        }
    }
}
