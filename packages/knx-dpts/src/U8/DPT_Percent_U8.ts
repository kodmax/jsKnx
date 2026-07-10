import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 5.004 — Percentage (8-bit, 0–255 → 0–100 %). */
export class DPT_Percent_U8 extends U8 {
    public readonly type: DPT = DPT.Percent_U8
    public readonly unit: string = '%'
}
