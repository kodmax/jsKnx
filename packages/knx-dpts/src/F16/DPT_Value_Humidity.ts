import { F16 } from './F16'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 9.007 — Relative humidity (%, 2-byte float). */
export class DPT_Value_Humidity extends F16 {
    public readonly type: DPT = DPT.Value_Humidity
    public readonly unit: string = '%'
}
