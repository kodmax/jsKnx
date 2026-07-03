import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

export class DPT_Window_Door extends B1 {
    public readonly type: DPT = DPT.Window_Door
    public readonly unit: string = ''

    public async open(): Promise<void> {
        return this.write(1)
    }

    public async closed(): Promise<void> {
        return this.write(0)
    }

    public getUnit(): string {
        return ''
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'open' : 'closed'
        }
    }
}
