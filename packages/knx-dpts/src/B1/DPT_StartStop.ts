import { B1 } from './B1'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 1.010 — Start/Stop (1-bit start or stop). */
export class DPT_StartStop extends B1 {
    public readonly type: DPT = DPT.Start
    public readonly unit: string = ''

    /** Send group write `1` (start). */
    public async start(): Promise<void> {
        return this.write(1)
    }

    /** Send group write `0` (stop). */
    public async stop(): Promise<void> {
        return this.write(0)
    }

    public toString(value?: number): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`
        } else {
            return value & 0x01 ? 'start' : 'stop'
        }
    }
}
