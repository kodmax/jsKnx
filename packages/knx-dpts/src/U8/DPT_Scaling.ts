import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'
import * as scalingCodec from './scaling-codec'

export class DPT_Scaling extends U8 {
    public readonly type: DPT = DPT.Scaling
    public readonly unit: string = ''

    public static fromBuffer = scalingCodec.fromBuffer
    public static toBuffer = scalingCodec.toBuffer

    protected decode(data: Buffer): number {
        return scalingCodec.fromBuffer(data)
    }

    public async write(value: number): Promise<void> {
        return this.send(scalingCodec.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }
}
