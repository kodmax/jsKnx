import { KnxDateTime } from './types'

export function fromBuffer(data: Buffer): KnxDateTime {
    return {
        year: data.readInt8(1) + 1900,
        month: data.readUint8(2),
        dayOfMonth: data.readUint8(3),
        dayOfWeek: (data.readUint8(4) & 0xe0) >> 5,
        hourOfDay: data.readUint8(4) & 0x1f,
        minutes: data.readUint8(5),
        seconds: data.readUint8(6),
        status: data.readUint16BE(7)
    }
}

export function toBuffer(dateTime: KnxDateTime, data: Buffer): Buffer {
    data.writeUint8((dateTime.year ?? 1900) - 1900, 1)
    data.writeUint8(dateTime.month ?? 0, 2)
    data.writeUint8(dateTime.dayOfMonth ?? 0, 3)
    data.writeUint8(((dateTime.dayOfWeek ?? 0) << 5) + (dateTime.hourOfDay || 0), 4)
    data.writeUint8(dateTime.minutes ?? 0, 5)
    data.writeUint8(dateTime.seconds ?? 0, 6)
    data.writeUInt16BE(dateTime.status, 7)

    return data
}
