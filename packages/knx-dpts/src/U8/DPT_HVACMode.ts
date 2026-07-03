import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'
import { hvacModeLabel } from './HVACMode'

export class DPT_HVACMode extends U8 {
    public readonly type: DPT = DPT.HVAC_HVACMode
    public readonly unit: string = ''

    public static readonly FROST_PROTECTION = 4
    /** @deprecated Use FROST_PROTECTION */
    public static readonly FROST_PROTECION = DPT_HVACMode.FROST_PROTECTION
    public static readonly ECONOMY = 3
    public static readonly STANDBY = 2
    public static readonly COMFORT = 1
    public static readonly AUTO = 0

    public toString(value?: number): string {
        if (value === undefined) {
            return super.toString()
        } else {
            return hvacModeLabel(value)
        }
    }
}
