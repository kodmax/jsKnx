import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1.002 — Boolean (1-bit true/false). */
export class DPT_Bool extends B1 {
    public readonly type: DPT = DPT.Bool
    public readonly unit: string = ''

    /** Send group write `1` (true). */
    public async setTrue(): Promise<void> {
        return this.write(1)
    }

    /** Send group write `0` (false). */
    public async setFalse(): Promise<void> {
        return this.write(0)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'true' : 'false'
        }
    }
}
