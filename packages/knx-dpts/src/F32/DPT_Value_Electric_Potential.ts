import { F32 } from './F32'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 14.027 — Electric potential / voltage (V, 4-byte float). */
export class DPT_Value_Electric_Potential extends F32 {
    public readonly type: DPT = DPT.Value_Electric_Potential
    public readonly unit: string = 'V'
}
