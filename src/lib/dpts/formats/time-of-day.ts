import { DataPointAbstract } from "./data-point-abstract"

enum DayOfWeek {
    "" = 0,
    Mon = 0x20,
    Tue = 0x40,
    Wed = 0x60,
    Thu = 0x80,
    Fri = 0xa0,
    Sat = 0xc0,
    Sun = 0xe0
}

const pattern = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun) )?(2[0-4]|[01]?[0-9]):([0-5]?[0-9])(?::([0-5]?[0-9]))?$/
export function fromBuffer(data: Buffer): string {
    const d = DayOfWeek[data.readUint8(1) & 0xe0]
    const h = data.readUint8(1) & 0x1f
    const m = data.readUint8(2)
    const s = data.readUint8(3)
    
    return `${d ? d + " " : ""}${h.toString(10).padStart(2, "0")}:${m.toString(10).padStart(2, "0")}:${s.toString(10).padStart(2, "0")}`
}

export function toBuffer(value: string, data: Buffer): Buffer {
    if (pattern.test(value)) {
        const [, d, h, m, s] = value.match(pattern)

        data.writeUint8(DayOfWeek[d || ""] + +h, 1)
        data.writeUint8(+m, 2)
        data.writeUint8(+s || 0, 3)

        return data

    } else {
        throw new Error("Invalid TimeOfDay string: " + value)
    }
}

export abstract class TimeOfDay extends DataPointAbstract<string> {

    protected decode(data: Buffer): string {
        return fromBuffer(data)
    }

    public async write(value: string): Promise<void> {
        return this.send(toBuffer(value, Buffer.alloc(4)))
    }

    public removeValueListener(cb: (value: string, unit: string, source: string) => void) {
        this.valueEvent.removeListener("value", cb)
        this.updateSubscription("value")
    }

    public addValueListener(cb: (value: string, unit: string, source: string) => void) {
        this.valueEvent.addListener("value", cb)
        this.updateSubscription("value")
    }
}

