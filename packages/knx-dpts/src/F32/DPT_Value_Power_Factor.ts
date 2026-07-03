import { F32 } from './F32'
import { DPT } from '@repo/knx-enums'

export class DPT_Value_Power_Factor extends F32 {
    public readonly type: DPT = DPT.Value_Power_Factor
    public readonly unit: string = ''

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return `${Number(value).toFixed(2)}`
        }
    }
}
