import { Z8 } from './Z8'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 21.001 — General status (8-bit status flags). */
export class DPT_StatusGen extends Z8 {
    public readonly type: DPT = DPT.StatusGen
    public readonly unit: string = ''
}
