import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1.005 — Alarm (1-bit alarm / no alarm). */
export class DPT_Alarm extends B1 {
    public readonly type: DPT = DPT.Alarm
    public readonly unit: string = ''

    /** Send group write `0` (no alarm). */
    public async noAlarm(): Promise<void> {
        return this.write(0)
    }

    /** Send group write `1` (alarm). */
    public async alarm(): Promise<void> {
        return this.write(1)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'alarm' : 'no alarm'
        }
    }
}
