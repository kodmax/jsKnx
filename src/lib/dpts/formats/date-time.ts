import { DataPointAbstract } from "./data-point-abstract"
import { DayOfWeek } from "./time-of-day"
import { KnxReading } from "../../types"

export type KnxDateTime = {
    year?: number
    month?: number
    dayOfMonth?: number
    dayOfWeek?: DayOfWeek
    hourOfDay?: number
    minutes?: number
    seconds?: number
    isFaulty: boolean
    isWorkingDay?: boolean
    isSummerTime: boolean
    isExternalSync: boolean
    isReliable: boolean
}

enum Status {
    F = 0x8000,
    WD = 0x4000,
    NWD = 0x2000,
    NY = 0x1000,
    ND = 0x0800,
    NDoW = 0x0400,
    NT = 0x0200,
    SUTI = 0x0100,
    CLQ = 0x0080,
    SRC = 0x0040
}
export function fromBuffer(data: Buffer): KnxDateTime {
    const status: number = data.readUint16BE(6)

    return {
        year: status & Status.NY ? undefined : data.readInt8(0) + 1900,
        month: status & Status.ND ? undefined : data.readUint8(1),
        dayOfMonth: status & Status.ND ? undefined : data.readUint8(2),
        dayOfWeek: status & Status.NDoW ? undefined : (data.readUint8(3) & 0xe0) >> 5,
        hourOfDay: status & Status.NT ? undefined : data.readUint8(3) & 0x1f,
        minutes: status & Status.NT ? undefined : data.readUint8(4),
        seconds: status & Status.NT ? undefined : data.readUint8(5),
        isFaulty: !!(status & Status.F),
        isWorkingDay: status & Status.NWD ? undefined : !!(status & Status.WD),
        isSummerTime: !!(status & Status.SUTI),
        isExternalSync: !!(status & Status.CLQ),
        isReliable: !!(status & Status.SRC)
    }
}


export function toBuffer(dateTime: KnxDateTime, data: Buffer): Buffer {
    data.writeUint8(dateTime.year - 1900, 0)
    data.writeUint8(dateTime.month, 1)
    data.writeUint8(dateTime.dayOfMonth, 2)
    data.writeUint8(((dateTime.dayOfWeek || 0) << 5) + (dateTime.hourOfDay || 0), 3)
    data.writeUint8(dateTime.minutes, 4)
    data.writeUint8(dateTime.seconds, 5)

    const status = [
        dateTime.isFaulty ? Status.F : 0,
        dateTime.isWorkingDay ? Status.WD : 0,
        dateTime.isWorkingDay === undefined ? Status.NWD : 0,
        dateTime.year === undefined ? Status.NY : 0,
        (dateTime.month === undefined || dateTime.dayOfMonth === undefined) ? Status.ND : 0,
        dateTime.dayOfWeek === undefined ? Status.NDoW : 0,
        (dateTime.hourOfDay === undefined || dateTime.minutes === undefined || dateTime.seconds === undefined) ? Status.NT : 0,
        dateTime.isSummerTime ? Status.SUTI : 0,
        dateTime.isExternalSync ? Status.CLQ : 0,
        dateTime.isReliable ? Status.SRC : 0
    ]
    
    data.writeUInt16BE(status.reduce((s, f) => s + f, 0), 6)
    return data
}

export abstract class DateTime extends DataPointAbstract<KnxDateTime> {

    protected decode(data: Buffer): KnxDateTime {
        return fromBuffer(data)
    }

    public async write(value: KnxDateTime): Promise<void> {
        return this.send(toBuffer(value, Buffer.alloc(9)))
    }

    public removeValueListener(cb: (reading: KnxReading<KnxDateTime>) => void) {
        this.valueEvent.removeListener("value-received", cb)
        this.updateSubscription("value-received")
    }

    public addValueListener(cb: (reading: KnxReading<KnxDateTime>) => void) {
        this.valueEvent.addListener("value-received", cb)
        this.updateSubscription("value-received")
    }

    public toString(value?: KnxDateTime): string {
        if (value === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return `${value.year}-${Number(value.month).toString().padStart(2, "0")}-${Number(value.dayOfMonth).toString().padStart(2, "0")} ${Number(value.hourOfDay).toString().padStart(2, "0")}:${Number(value.minutes).toString().padStart(2, "0")}:${Number(value.seconds).toString().padStart(2, "0")}`
        }
    }
}

