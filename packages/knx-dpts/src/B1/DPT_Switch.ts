import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1.001 — Switch (1-bit on/off). */
export class DPT_Switch extends B1 {
    public readonly type: DPT = DPT.Switch
    public readonly unit: string = ''

    /** Send group write `1` (on). */
    public async on(): Promise<void> {
        return this.write(1)
    }

    /** Send group write `0` (off). */
    public async off(): Promise<void> {
        return this.write(0)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'on' : 'off'
        }
    }
}
