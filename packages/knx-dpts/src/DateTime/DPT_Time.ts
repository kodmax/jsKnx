import { TimeOfDay } from '../TimeOfDay/TimeOfDay'
import { DPT } from '@repo/knx-enums'

export class DPT_Time extends TimeOfDay {
    public readonly type: DPT = DPT.Time
    public readonly unit: string = ''
}
