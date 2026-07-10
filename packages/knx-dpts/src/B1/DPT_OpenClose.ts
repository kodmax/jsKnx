import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1.009 — Open/Close (1-bit open or close). */
export class DPT_OpenClose extends B1 {
    public readonly type: DPT = DPT.OpenClose
    public readonly unit: string = ''

    /** Send group write `1` (close). */
    public async close(): Promise<void> {
        return this.write(1)
    }

    /** Send group write `0` (open). */
    public async open(): Promise<void> {
        return this.write(0)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'close' : 'open'
        }
    }
}
