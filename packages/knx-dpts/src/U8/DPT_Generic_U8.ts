import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 3 — generic 8-bit unsigned value. */
export class DPT_Generic_U8 extends U8 {
    public readonly type: DPT = DPT.Generic_U8
    public readonly unit: string = ''
}
