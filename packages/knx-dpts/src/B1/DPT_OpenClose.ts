import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

export class DPT_OpenClose extends B1 {
    public readonly type: DPT = DPT.OpenClose
    public readonly unit: string = ''

    public async close(): Promise<void> {
        return this.write(1)
    }

    public async open(): Promise<void> {
        return this.write(0)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'close' : 'open'
        }
    }
}
