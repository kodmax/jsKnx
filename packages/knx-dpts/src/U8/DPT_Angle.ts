import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'
import * as angleCodec from './angle-codec'

export class DPT_Angle extends U8 {
    public readonly type: DPT = DPT.Angle
    public readonly unit: string = '°'

    public static fromBuffer = angleCodec.fromBuffer
    public static toBuffer = angleCodec.toBuffer

    protected decode(data: Buffer): number {
        return angleCodec.fromBuffer(data)
    }

    public async write(value: number): Promise<void> {
        return this.send(angleCodec.toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }
}
