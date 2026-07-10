import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'
import { hvacModeLabel } from './HVACMode'

/**
 * KNX DPT 20.102 — HVAC mode (comfort, economy, frost protection, …).
 *
 * Use static constants (`AUTO`, `COMFORT`, …) with `write()`.
 */
export class DPT_HVACMode extends U8 {
    public readonly type: DPT = DPT.HVAC_HVACMode
    public readonly unit: string = ''

    /** HVAC mode: frost protection. */
    public static readonly FROST_PROTECTION = 4
    /** @deprecated Use FROST_PROTECTION */
    public static readonly FROST_PROTECION = DPT_HVACMode.FROST_PROTECTION
    /** HVAC mode: economy. */
    public static readonly ECONOMY = 3
    /** HVAC mode: standby. */
    public static readonly STANDBY = 2
    /** HVAC mode: comfort. */
    public static readonly COMFORT = 1
    /** HVAC mode: auto. */
    public static readonly AUTO = 0

    public toString(value?: number): string {
        if (value === undefined) {
            return super.toString()
        } else {
            return hvacModeLabel(value)
        }
    }
}
