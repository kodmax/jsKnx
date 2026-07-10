import { DateTime } from './DateTime'
import { DTStatus } from './DTStatus'
import type { KnxDateTime } from './types'
import { DPT } from '@repo/knx-enums'
import { KnxLinkException } from '@repo/knx-common'
import { datePattern, timePattern } from './patterns'

/**
 * KNX DPT 19.001 — Date and time (structured {@link KnxDateTime} value).
 *
 * Static helpers build payloads for `write()` from date/time strings.
 */
export class DPT_DateTime extends DateTime {
    public readonly type: DPT = DPT.DateTime
    public readonly unit: string = ''

    /** Return whether a JavaScript `Date` falls in daylight-saving time for the local timezone. */
    public static isDST = (date: Date): boolean => {
        return (
            date.getTimezoneOffset() < Math.max(new Date(date.getFullYear(), 0, 1).getTimezoneOffset(), new Date(date.getFullYear(), 6, 1).getTimezoneOffset())
        )
    }

    /** Build a full date-time value from `YYYY-MM-DD` and `HH:MM:SS` strings. */
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

    /** Build a time-only value from an `HH:MM:SS` string (date fields marked invalid). */
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

    /** Build a date-only value from a `YYYY-MM-DD` string (time fields marked invalid). */
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
