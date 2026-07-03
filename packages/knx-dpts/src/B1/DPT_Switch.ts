import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

export class DPT_Switch extends B1 {
    public readonly type: DPT = DPT.Switch
    public readonly unit: string = ''

    public async on(): Promise<void> {
        return this.write(1)
    }

    public async off(): Promise<void> {
        return this.write(0)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'on' : 'off'
        }
    }
}
