import { DataPoint, DataPointAbstract } from "./types"

export class B1 extends DataPointAbstract implements DataPoint<boolean> {

    private fromBuffer(buf: Buffer, position: number = 0): boolean {
        return (buf.readUint8(position) & 0x01) === 1
    }

    private toBuffer(value: boolean, buf: Buffer, position: number = 0): Buffer {
        buf.writeUint8(value ? 1 : 0, position)
        return buf
    }

    public async ping(): Promise<void> {

    }

    public async read(): Promise<boolean> {
        return this.fromBuffer(Buffer.alloc(1))
    }

    public async write(value: boolean): Promise<void> {
        console.log('Write', this.toBuffer(value, Buffer.alloc(1)), 'to', this.addresses [0])

        this.toBuffer(value, Buffer.alloc(1))
    }

    public on(eventType: string, cb: (value: boolean) => Promise<void>) {

    }    
}

