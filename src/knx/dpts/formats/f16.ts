import EventEmitter from "events"
import { KnxConnection } from "../../connection/connection"
import { KnxCemiFrame } from "../../message"
import { DataPointAbstract } from "./data-point-abstract"

export abstract class F16 extends DataPointAbstract<number> {
    private valueEvent: EventEmitter = new EventEmitter()

    private fromBuffer(buf: Buffer, position = 0): number {
        const value = buf.readUint16BE(position)
        const e = (value >> 11) & 0x0f
        const m = value & 0x07ff
        const s = value & 0x8000

        return 0.01 * m * 2**e * (s ? -1 : 1)
    }

    private toBuffer(value: number, buf: Buffer, position = 0): Buffer {
        value = NaN
        buf.writeUint16BE(value, position)
        return buf
    }

    protected decode(data: Buffer): number {
        return this.fromBuffer(data)
    }

    public async write(value: number): Promise<void> {
        return this.send(this.toBuffer(value, Buffer.alloc(4)))
    }

    public constructor(protected connection: KnxConnection, protected readonly address: string, protected readonly events: EventEmitter) {
        super(connection, address, events)
        
        events.on("tunnel-request", (cemiFrame: KnxCemiFrame) => {
            if (cemiFrame.target === address) {
                this.valueEvent.emit("value", this.decode(cemiFrame.value), this.unit, cemiFrame.source)
            }
        })
    }

    public removeValueListener(cb: (value: number, unit: string, source: string) => void) {
        this.valueEvent.removeListener("value", cb)
    }

    public addValueListener(cb: (value: number, unit: string, source: string) => void) {
        this.valueEvent.addListener("value", cb)
    }
}

