import { F32 } from './F32'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 14.019 — Electric current (A, 4-byte float). */
export class DPT_Value_Electric_Current extends F32 {
    public readonly type: DPT = DPT.Value_Electric_Current
    public readonly unit: string = 'A'

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return `${Number(value).toFixed(3)} ${this.unit}`
        }
    }
}
