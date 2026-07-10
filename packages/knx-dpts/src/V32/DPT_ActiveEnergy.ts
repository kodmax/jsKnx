import { V32 } from './V32'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 13.010 — Active energy (Wh, 4-byte signed integer). */
export class DPT_ActiveEnergy extends V32 {
    public readonly type: DPT = DPT.ActiveEnergy
    public readonly unit: string = 'Wh'
}
