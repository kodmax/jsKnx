import { U8 } from './U8'
import { DPT } from '@repo/knx-enums'

export class DPT_Generic_U8 extends U8 {
    public readonly type: DPT = DPT.Generic_U8
    public readonly unit: string = ''
}
