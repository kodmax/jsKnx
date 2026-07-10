import { F16 } from './F16'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 9.001 — Temperature (°C, 2-byte float). */
export class DPT_Value_Temp extends F16 {
    public readonly type: DPT = DPT.Value_Temp
    public readonly unit: string = '°C'
}
