import { F16 } from './F16'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 9.008 — Air quality (ppm, 2-byte float). */
export class DPT_Value_AirQuality extends F16 {
    public readonly type: DPT = DPT.Value_AirQuality
    public readonly unit: string = 'ppm'
}
