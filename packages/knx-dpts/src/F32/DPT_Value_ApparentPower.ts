import { F32 } from './F32'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 14.080 — Apparent power (VA, 4-byte float). */
export class DPT_Value_ApparentPower extends F32 {
    public readonly type: DPT = DPT.Value_ApparentPower
    public readonly unit: string = 'VA'
}
