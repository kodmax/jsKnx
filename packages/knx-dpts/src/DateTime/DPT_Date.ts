import { Date as KnxDate } from '../Date/Date'
import { DPT } from '@repo/knx-enums'

export class DPT_Date extends KnxDate {
    public readonly type: DPT = DPT.Date
    public readonly unit: string = ''
}
