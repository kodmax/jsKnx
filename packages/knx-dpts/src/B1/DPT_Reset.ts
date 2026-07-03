import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

export class DPT_Reset extends B1 {
    public readonly type: DPT = DPT.Reset
    public readonly unit: string = ''

    public async reset(): Promise<void> {
        return this.write(1)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'reset' : '<noop>'
        }
    }
}
