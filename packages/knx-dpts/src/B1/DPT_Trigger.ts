import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

export class DPT_Trigger extends B1 {
    public readonly type: DPT = DPT.Trigger
    public readonly unit: string = ''

    /**
     * Trigger function.
     * @param value {0|1} value to use. According to KNX specification it should not matter whenever 0 or 1 is used. For some devices, it seems to matter.
     * @returns
     */
    public async trigger(value: 0 | 1 = 0): Promise<void> {
        return this.write(value)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'trigger' : 'trigger'
        }
    }
}
