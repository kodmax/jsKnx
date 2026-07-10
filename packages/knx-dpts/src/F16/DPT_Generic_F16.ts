import { F16 } from './F16'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1 — generic 16-bit float value. */
export class DPT_Generic_F16 extends F16 {
    public readonly type: DPT = DPT.Generic_F16
    public readonly unit: string = ''
}
