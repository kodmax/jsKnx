import { F32 } from './F32'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 14.056 — Active power (W, 4-byte float). */
export class DPT_Value_Power extends F32 {
    public readonly type: DPT = DPT.Value_Power
    public readonly unit: string = 'W'
}
