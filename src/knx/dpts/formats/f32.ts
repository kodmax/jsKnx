import EventEmitter from "events"
import { KnxConnection } from "../../connection/connection"
import { KnxCemiFrame } from "../../message"
import { DataPointAbstract } from "./data-point-abstract"

export abstract class F32 extends DataPointAbstract<number> {
    private valueEvent: EventEmitter = new EventEmitter()

    private fromBuffer(buf: Buffer, position = 0): number {
        return buf.readFloatBE(position)
    }

    private toBuffer(value: number, buf: Buffer, position = 0): Buffer {
        buf.writeFloatBE(value, position)
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

