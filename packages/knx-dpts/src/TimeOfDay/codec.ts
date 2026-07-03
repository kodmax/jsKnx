import { KnxLinkException } from '@js-knx-internal/types'
import { DayOfWeek } from './DayOfWeek'

export function fromBuffer(data: Buffer): number[] {
    const d = (data.readUint8(1) & 0xe0) >> 5
    const h = data.readUint8(1) & 0x1f
    const m = data.readUint8(2)
    const s = data.readUint8(3)

    return [d, h, m, s]
}

const pattern = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun) )?(2[0-3]|[01]?[0-9]):([0-5]?[0-9])(?::([0-5]?[0-9]))?$/

export function toBuffer(value: string, data: Buffer): Buffer {
    const match = value.match(pattern)
    if (match) {
        const [, d, h, m, s] = match

        const dayNumber = DayOfWeek[(d ?? '') as keyof typeof DayOfWeek]
        data.writeUint8((dayNumber << 5) + +h, 1)

        data.writeUint8(+m, 2)
        data.writeUint8(+s || 0, 3)

        return data
    } else {
        throw new KnxLinkException('INVALID_VALUE', 'Invalid TimeOfDay string: ' + value, {
            value
        })
    }
}
