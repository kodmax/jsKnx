import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

export class DPT_Ack extends B1 {
    public readonly type: DPT = DPT.Ack
    public readonly unit: string = ''

    public async acknowledge(): Promise<void> {
        return this.write(1)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'ack' : '<noop>'
        }
    }
}
