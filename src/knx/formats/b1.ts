import { DataPoint, DataPointAbstract } from "./types"

export class B1 extends DataPointAbstract<number> implements DataPoint<number> {

    private fromBuffer(buf: Buffer, position: number = 0): number {
        return buf.readUint8(position) & 0x01
    }

    private toBuffer(value: number, buf: Buffer, position: number = 0): Buffer {
        buf.writeUint8((value & 0x01) === 1 ? 1 : 0, position)
        return buf
    }

    public async ping(): Promise<void> {

    }

    public async read(): Promise<number> {
        return this.fromBuffer(Buffer.alloc(1))
    }

    public async write(value: number): Promise<void> {
        console.log('Write', this.toBuffer(value, Buffer.alloc(1)), 'to', this.addresses [0])
        this.triggerEvent("write", value)
        this.toBuffer(value, Buffer.alloc(1))
    }
}

