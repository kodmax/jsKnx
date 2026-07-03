import { V32 } from './V32'
import { DPT } from '@repo/knx-enums'

export class DPT_ActiveEnergy extends V32 {
    public readonly type: DPT = DPT.ActiveEnergy
    public readonly unit: string = 'Wh'
}
