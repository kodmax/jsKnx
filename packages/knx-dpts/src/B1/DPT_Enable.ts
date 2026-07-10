import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1.003 — Enable (1-bit enabled/disabled). */
export class DPT_Enable extends B1 {
    public readonly type: DPT = DPT.Enable
    public readonly unit: string = ''

    /** Send group write `1` (enabled). */
    public async enable(): Promise<void> {
        return this.write(1)
    }

    /** Send group write `0` (disabled). */
    public async disable(): Promise<void> {
        return this.write(0)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'enable' : 'disable'
        }
    }
}
