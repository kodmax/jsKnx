import { DataPointAbstract } from "./data-point-abstract"

export abstract class F16 extends DataPointAbstract<number> {
    private fromBuffer(buf: Buffer): number {
        const value = buf.readUint16BE(1)
        const e = (value >> 11) & 0x0f
        const m = value & 0x07ff
        const s = value & 0x8000

        return 0.01 * m * 2**e * (s ? -1 : 1)
    }

    private toBuffer(value: number, buf: Buffer): Buffer {
        buf.writeUint16BE(0xffff, 1)
        buf.writeUint8(0x80, 0)
        return buf
    }

    protected decode(data: Buffer): number {
        return this.fromBuffer(data)
    }

    public async write(value: number): Promise<void> {
        return this.send(this.toBuffer(value, Buffer.alloc(3)))
    }

    public removeValueListener(cb: (value: number, unit: string, source: string) => void) {
        this.valueEvent.removeListener("value", cb)
    }

    public addValueListener(cb: (value: number, unit: string, source: string) => void) {
        this.valueEvent.addListener("value", cb)
    }
}

