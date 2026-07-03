import { V32 } from './V32'
import { DPT } from '@repo/knx-enums'

export class DPT_Generic_V32 extends V32 {
    public readonly type: DPT = DPT.Generic_V32
    public readonly unit: string = ''
}
