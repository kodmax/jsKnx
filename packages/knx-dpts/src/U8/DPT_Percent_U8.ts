import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'

export class DPT_Percent_U8 extends U8 {
    public readonly type: DPT = DPT.Percent_U8
    public readonly unit: string = '%'
}
