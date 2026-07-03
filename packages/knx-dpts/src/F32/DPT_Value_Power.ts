import { F32 } from './F32'
import { DPT } from '@repo/knx-enums'

export class DPT_Value_Power extends F32 {
    public readonly type: DPT = DPT.Value_Power
    public readonly unit: string = 'W'
}
