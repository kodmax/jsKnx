import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'
import { HVACContrMode } from './HVACContrMode'

/**
 * KNX DPT 20.105 — HVAC controller mode.
 *
 * Use {@link setMode} / {@link readMode} or `write()` with {@link MODE} enum values.
 */
export class DPT_HVACContrMode extends U8 {
    public readonly type: DPT = DPT.HVAC_HVACContrMode
    public readonly unit: string = ''

    /** Enum of supported HVAC controller modes. */
    public static readonly MODE: typeof HVACContrMode = HVACContrMode

    /** Write the HVAC controller mode. */
    public async setMode(mode: HVACContrMode): Promise<void> {
        return this.write(mode)
    }

    /** Read the current HVAC controller mode. */
    public async readMode(): Promise<HVACContrMode> {
        return (await this.read()).value as HVACContrMode
    }
}
