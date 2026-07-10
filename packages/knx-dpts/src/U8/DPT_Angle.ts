import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'
import * as angleCodec from './angle-codec'

/**
 * KNX DPT 5.003 — Angle (degrees, 1 byte).
 *
 * `write()` accepts degrees; encoding uses the DPT 5.003 angle codec.
 */
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
