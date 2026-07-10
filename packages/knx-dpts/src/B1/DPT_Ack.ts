import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1.016 — Acknowledge (1-bit alarm acknowledge). */
export class DPT_Ack extends B1 {
    public readonly type: DPT = DPT.Ack
    public readonly unit: string = ''

    /** Send group write `1` (acknowledge). */
    public async acknowledge(): Promise<void> {
        return this.write(1)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'ack' : '<noop>'
        }
    }
}
