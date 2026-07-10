import { Date as KnxDate } from '../Date/Date'
import { DPT } from '@repo/knx-enums'

/** KNX DPT 11.001 — Date (`YYYY-MM-DD` string). */
export class DPT_Date extends KnxDate {
    public readonly type: DPT = DPT.Date
    public readonly unit: string = ''
}
