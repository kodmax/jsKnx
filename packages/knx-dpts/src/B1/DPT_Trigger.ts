import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1.017 — Trigger (1-bit impulse). */
export class DPT_Trigger extends B1 {
    public readonly type: DPT = DPT.Trigger
    public readonly unit: string = ''

    /**
     * Send a trigger impulse.
     *
     * @param value `0` or `1`; the KNX spec treats both as a trigger, though some devices are sensitive to the bit value.
     */
    public async trigger(value: 0 | 1 = 0): Promise<void> {
        return this.write(value)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'trigger' : 'trigger'
        }
    }
}
