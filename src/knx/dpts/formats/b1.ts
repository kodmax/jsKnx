import { DataPointAbstract } from "./data-point-abstract"

export abstract class B1 extends DataPointAbstract<number> {

    private fromBuffer(buf: Buffer): number {
        return buf.readUint8(0) & 0x01
    }

    private toBuffer(value: number, buf: Buffer): Buffer {
        buf.writeUint8((value & 0x01) === 1 ? 0x81 : 0x80, 0)
        return buf
    }

    protected decode(data: Buffer): number {
        return this.fromBuffer(data)
    }

    public async write(value: number): Promise<void> {
        return this.send(this.toBuffer(value, Buffer.alloc(1)))
    }

    public removeValueListener(cb: (value: number, unit: string, source: string) => void) {
        this.valueEvent.removeListener("value", cb)
    }

    public addValueListener(cb: (value: number, unit: string, source: string) => void) {
        this.valueEvent.addListener("value", cb)
    }
}
