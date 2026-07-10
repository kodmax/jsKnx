import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1.011 — State (1-bit active/inactive). */
export class DPT_State extends B1 {
    public readonly type: DPT = DPT.State
    public readonly unit: string = ''

    /** Encoded value for inactive state. */
    public static readonly INACTIVE = 0
    /** Encoded value for active state. */
    public static readonly ACTIVE = 1

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'active' : 'inactive'
        }
    }
}
