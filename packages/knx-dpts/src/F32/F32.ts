import { DataPointAbstract } from '../DataPointAbstract'
import * as codec from './codec'

export abstract class F32 extends DataPointAbstract<number> {
    protected valueByteLength: number = 5

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
            return this.unit ? `${Number(value).toFixed(4)} ${this.unit}` : Number(value).toFixed(4)
        }
    }
}
