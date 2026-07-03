import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

export class DPT_Generic_B1 extends B1 {
    public readonly type: DPT = DPT.Generic_B1
    public readonly unit: string = ''
}
