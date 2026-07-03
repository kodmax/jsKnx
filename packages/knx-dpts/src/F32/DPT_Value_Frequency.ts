import { F32 } from './F32'
import { DPT } from '@repo/knx-enums'

export class DPT_Value_Frequency extends F32 {
    public readonly type: DPT = DPT.Value_Frequency
    public readonly unit: string = 'Hz'

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return `${Number(value).toFixed(2)} ${this.unit}`
        }
    }
}
