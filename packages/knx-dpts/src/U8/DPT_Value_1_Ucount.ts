import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 5.010 — Value 1 octet unsigned count. */
export class DPT_Value_1_Ucount extends U8 {
    public readonly type: DPT = DPT.Value_1_Ucount
    public readonly unit: string = ''
}
