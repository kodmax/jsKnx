import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 5.006 — Tariff (8-bit tariff index). */
export class DPT_Tariff extends U8 {
    public readonly type: DPT = DPT.Tariff
    public readonly unit: string = ''
}
