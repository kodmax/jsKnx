import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1.024 — Day/Night (1-bit day or night mode). */
export class DPT_DayNight extends B1 {
    public readonly type: DPT = DPT.DayNight
    public readonly unit: string = ''

    /** Send group write `1` (night). */
    public async night(): Promise<void> {
        return this.write(1)
    }

    /** Send group write `0` (day). */
    public async day(): Promise<void> {
        return this.write(0)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'night' : 'day'
        }
    }
}
