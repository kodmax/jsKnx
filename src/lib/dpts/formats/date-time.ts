import { DataPointAbstract } from './data-point-abstract'
import { DayOfWeek } from './time-of-day'
import { KnxReading } from '../../types'

export type KnxDateTime = {
    year?: number
    month?: number
    dayOfMonth?: number
    dayOfWeek?: DayOfWeek
    hourOfDay?: number
    minutes?: number
    seconds?: number
    status: number
}

export enum DTStatus {
    /** Faulty */
    F = 0x8000,
    /** Working day / Bank holiday */
    WD = 0x4000,
    /** Working day not valid */
    NWD = 0x2000,
    /** Year not valid */
    NY = 0x1000,
    /** Month and day of months not valid */
    ND = 0x0800,
    /** Day of week not valid */
    NDoW = 0x0400,
    /** Hour, minute and second not valid */
    NT = 0x0200,
    /** Daylight saving time UT+X+1 */
    SUTI = 0x0100,
    /** Is external sync clock */
    CLQ = 0x0080,
    /** Is reliable */
    SRC = 0x0040
}

export function fromBuffer (data: Buffer): KnxDateTime {
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

export function toBuffer (dateTime: KnxDateTime, data: Buffer): Buffer {
    data.writeUint8((dateTime.year ?? 1900) - 1900, 1)
    data.writeUint8(dateTime.month ?? 0, 2)
    data.writeUint8(dateTime.dayOfMonth ?? 0, 3)
    data.writeUint8(((dateTime.dayOfWeek ?? 0) << 5) + (dateTime.hourOfDay || 0), 4)
    data.writeUint8(dateTime.minutes ?? 0, 5)
    data.writeUint8(dateTime.seconds ?? 0, 6)
    data.writeUInt16BE(dateTime.status, 7)

    return data
}

export abstract class DateTime extends DataPointAbstract<KnxDateTime> {
    protected valueByteLength: number = 9

    protected decode (data: Buffer): KnxDateTime {
        return fromBuffer(data)
    }

    public async write (value: KnxDateTime): Promise<void> {
        return this.send(toBuffer(value, Buffer.alloc(this.valueByteLength)))
    }

    public removeValueListener (cb: (reading: KnxReading<KnxDateTime>) => void) {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public addValueListener (cb: (reading: KnxReading<KnxDateTime>) => void) {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString (value?: KnxDateTime): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            const dayOfMonth = Number(value.dayOfMonth).toString().padStart(2, '0')
            const month = Number(value.month).toString().padStart(2, '0')
            const year = value.year

            const hourOfDay = Number(value.hourOfDay).toString().padStart(2, '0')
            const minutes = Number(value.minutes).toString().padStart(2, '0')
            const seconds = Number(value.seconds).toString().padStart(2, '0')

            return `${year}-${month}-${dayOfMonth} ${hourOfDay}:${minutes}:${seconds}`
        }
    }
}
