import { DateTime } from './DateTime'
import { DTStatus } from './DTStatus'
import type { KnxDateTime } from './types'
import { DPT } from '@repo/knx-enums'
import { KnxLinkException } from '@js-knx-internal/types'
import { datePattern, timePattern } from './patterns'

export class DPT_DateTime extends DateTime {
    public readonly type: DPT = DPT.DateTime
    public readonly unit: string = ''

    public static isDST = (date: Date): boolean => {
        return (
            date.getTimezoneOffset() < Math.max(new Date(date.getFullYear(), 0, 1).getTimezoneOffset(), new Date(date.getFullYear(), 6, 1).getTimezoneOffset())
        )
    }

    public static setDateTime(date: string, time: string, isDST: boolean): KnxDateTime {
        const dateMatch = date.match(datePattern)
        if (!dateMatch) {
            throw new KnxLinkException('INVALID_VALUE', 'Invalid Date: ' + date, {
                value: date
            })
        }

        const timeMatch = time.match(timePattern)
        if (!timeMatch) {
            throw new KnxLinkException('INVALID_VALUE', 'Invalid Time: ' + time, {
                value: time
            })
        }

        const [, h, minutes, s] = timeMatch
        const [, y, month, d] = dateMatch

        return {
            status: DTStatus.NWD + DTStatus.NDoW + (isDST ? DTStatus.SUTI : 0) + DTStatus.CLQ + DTStatus.SRC,
            year: +y,
            month: +month,
            dayOfMonth: +d,
            hourOfDay: +h,
            minutes: +minutes,
            seconds: +s || 0
        }
    }

    public static setTime(time: string, isDST: boolean): KnxDateTime {
        const match = time.match(timePattern)
        if (match) {
            const [, h, m, s] = match

            return {
                status: DTStatus.NWD + DTStatus.NDoW + (isDST ? DTStatus.SUTI : 0) + DTStatus.CLQ + DTStatus.SRC + DTStatus.ND + DTStatus.NY,
                hourOfDay: +h,
                minutes: +m,
                seconds: +s || 0
            }
        } else {
            throw new KnxLinkException('INVALID_VALUE', 'Invalid Time: ' + time, {
                value: time
            })
        }
    }

    public static setDate(date: string, isDST: boolean): KnxDateTime {
        const match = date.match(datePattern)
        if (match) {
            const [, y, m, d] = match

            return {
                status: DTStatus.NWD + DTStatus.NDoW + (isDST ? DTStatus.SUTI : 0) + DTStatus.CLQ + DTStatus.SRC + DTStatus.NT,
                year: +y - 1900,
                month: +m,
                dayOfMonth: +d
            }
        } else {
            throw new KnxLinkException('INVALID_VALUE', 'Invalid Date: ' + date, {
                value: date
            })
        }
    }
}
