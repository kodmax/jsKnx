import { DataPointAbstract } from "./data-point-abstract"

export function fromBuffer(data: Buffer): number[] {
    const d = data.readUint8(1)
    const m = data.readUint8(2)
    const y = data.readUint8(3)
    
    return [d, m, y >= 90 ? 1900 + y : 2000 + y]
}
const pattern = /^(\d\d\d\d)-(\d\d)-(\d\d)$/

export function toBuffer(value: string, data: Buffer): Buffer {
    if (pattern.test(value)) {
        const [, y, m, d] = value.match(pattern)

        data.writeUint8(+d, 1)
        data.writeUint8(+m, 2)

        const yy = +y
        if (yy >= 2000 && yy < 2090) {
            data.writeUint8(yy - 2000, 3)

        } else if (yy >= 1990 && yy < 2000) {
            data.writeUint8(yy - 1900, 3)

        } else {
            throw new Error("Invalid Date Year: " + y)
        }

        return data

    } else {
        throw new Error("Invalid Date string: " + value)
    }
}

export abstract class TimeOfDay extends DataPointAbstract<string> {

    protected decode(data: Buffer): string {
        const [d, m, y] = fromBuffer(data)

        return `${y.toString(10)}-${m.toString(10).padStart(2, "0")}-${d.toString(10).padStart(2, "0")}`
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

