import { F32 } from './F32'
import { DPT } from '@repo/knx-enums'

export class DPT_Generic_F32 extends F32 {
    public readonly type: DPT = DPT.Generic_F32
    public readonly unit: string = ''
}
