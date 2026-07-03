import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'

export class DPT_Tariff extends U8 {
    public readonly type: DPT = DPT.Tariff
    public readonly unit: string = ''
}
