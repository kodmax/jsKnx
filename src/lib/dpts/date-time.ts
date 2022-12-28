import { DateTime, KnxDateTime, Date, TimeOfDay } from './formats'
import { DPT } from '../enums'
import { DayOfWeek } from './formats/time-of-day'

export { KnxDateTime }

const timePattern = /^(2[0-4]|[01]?[0-9]):([0-5]?[0-9])(?::([0-5]?[0-9]))?$/
const datePattern = /^(\d\d\d\d)-(\d\d)-(\d\d)$/

export class DPT_DateTime extends DateTime {
    public readonly type: DPT = DPT.DateTime
    public readonly unit: string = ''

    public async setDateTime (date: string, time: string, DST: boolean, dayOfWeek?: DayOfWeek, isWorkingDay?: boolean) {
        const dateMatch = date.match(datePattern)
        if (!dateMatch) {
            throw new Error('Invalid Date: ' + date)
        }

        const timeMatch = time.match(timePattern)
        if (!timeMatch) {
            throw new Error('Invalid Time: ' + time)
        }

        const [, h, minutes, s] = timeMatch
        const [, y, month, d] = dateMatch

        return this.write({
            year: +y,
            month: +month,
            dayOfMonth: +d,
            hourOfDay: +h,
            minutes: +minutes,
            seconds: +s,
            isExternalSync: true,
            isReliable: true,
            isFaulty: false,
            isSummerTime: DST,
            dayOfWeek,
            isWorkingDay
        })
    }

    public async setTime (time: string, DST: boolean): Promise<void> {
        const match = time.match(timePattern)
        if (match) {
            const [, h, m, s] = match
            return this.write({
                hourOfDay: +h,
                minutes: +m,
                seconds: +s,
                isExternalSync: true,
                isFaulty: false,
                isReliable: true,
                isSummerTime: DST
            })

        } else {
            throw new Error('Invalid Time: ' + time)
        }
    }

    public async setDate (date: string, DST: boolean): Promise<void> {
        const match = date.match(datePattern)
        if (match) {
            const [, y, m, d] = match
            return this.write({
                year: +y - 1900,
                month: +m,
                dayOfMonth: +d,
                isExternalSync: true,
                isReliable: true,
                isFaulty: false,
                isSummerTime: DST
            })

        } else {
            throw new Error('Invalid Date: ' + date)
        }
    }
}

export class DPT_Date extends Date {
    public readonly type: DPT = DPT.Date
    public readonly unit: string = ''
}

export class DPT_Time extends TimeOfDay {
    public readonly type: DPT = DPT.Time
    public readonly unit: string = ''
}
