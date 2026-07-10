import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 0 — generic 1-bit value (raw boolean encoding). */
export class DPT_Generic_B1 extends B1 {
    public readonly type: DPT = DPT.Generic_B1
    public readonly unit: string = ''
}
