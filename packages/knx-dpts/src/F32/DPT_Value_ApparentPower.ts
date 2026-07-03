import { F32 } from './F32'
import { DPT } from '@repo/knx-enums'

export class DPT_Value_ApparentPower extends F32 {
    public readonly type: DPT = DPT.Value_ApparentPower
    public readonly unit: string = 'VA'
}
