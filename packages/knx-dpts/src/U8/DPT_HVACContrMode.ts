import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'
import { HVACContrMode } from './HVACContrMode'

export class DPT_HVACContrMode extends U8 {
    public readonly type: DPT = DPT.HVAC_HVACContrMode
    public readonly unit: string = ''

    public static readonly MODE: typeof HVACContrMode = HVACContrMode

    public async setMode(mode: HVACContrMode): Promise<void> {
        return this.write(mode)
    }

    public async readMode(): Promise<HVACContrMode> {
        return (await this.read()).value as HVACContrMode
    }
}
