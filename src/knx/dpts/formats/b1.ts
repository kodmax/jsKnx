import { DataPointAbstract } from "./data-point-abstract"

export abstract class B1 extends DataPointAbstract<number> {

    private fromBuffer(buf: Buffer, position = 0): number {
        return buf.readUint8(position) & 0x01
    }

    private toBuffer(value: number, buf: Buffer, position = 0): Buffer {
        buf.writeUint8((value & 0x01) === 1 ? 1 : 0, position)
        return buf
    }

    protected decode(data: Buffer): number {
        return this.fromBuffer(data)
    }

    public async write(value: number): Promise<void> {
        return this.send(this.toBuffer(value, Buffer.alloc(1)))
    }
}

