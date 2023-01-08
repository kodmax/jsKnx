import { DataPointAbstract } from './data-point-abstract'
import { KnxReading } from '../../types'

function getBit (i: number, octet: number): number {
    return octet & (1 << i) ? 1 : 0
}

export abstract class B8 extends DataPointAbstract<number[]> {
    protected valueByteLength: number = 2

    public static fromBuffer (buf: Buffer): number[] {
        const octet = buf.readUint8(1)

        return [getBit(7, octet), getBit(6, octet), getBit(5, octet), getBit(4, octet), getBit(3, octet), getBit(2, octet), getBit(1, octet), getBit(0, octet)]
    }

    public static toBuffer (bits: number[], buf: Buffer): Buffer {
        // eslint-disable-next-line no-return-assign
        const octet = bits.reduce((a, b, i) => a += b ? 1 << (7 - i) : 0, 0)
        buf.writeUint8(octet, 1)
        return buf
    }

    protected decode (data: Buffer): number[] {
        return B8.fromBuffer(data)
    }

    public async write (bits: number[]): Promise<void> {
        return this.send(B8.toBuffer(bits, Buffer.alloc(this.valueByteLength)))
    }

    public removeValueListener (cb: (reading: KnxReading<number[]>) => void) {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public addValueListener (cb: (reading: KnxReading<number[]>) => void) {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription('value-received')
    }

    public toString (bits?: number[]): string {
        if (bits === undefined) {
            return `${this.address} (${this.type})`

        } else {
            return `[${bits.join('')}]`
        }
    }
}
