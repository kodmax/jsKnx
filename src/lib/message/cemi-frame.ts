import { CemiSequenceType, KnxCemiCode, CemiPacketType, APCI } from '../enums'

function decodeAddress (address: number) {
    return [address >> 12, (address >> 8) & 0xf, address & 0xff]
}

export class KnxCemiFrame {
    public readonly source: string
    public readonly target: string
    public readonly value: Buffer

    public constructor (private readonly frame: Buffer) {
        if (frame.readUint8(0) !== KnxCemiCode.L_Data_Indication) {
            throw new Error('Not a cEMI frame')
        }

        const source = frame.readUint16BE(4)
        const target = frame.readUint16BE(6)

        this.target = [(target >> 11) & 0xf, (target >> 8) & 0x7, target & 0xff].join('/')
        this.source = [source >> 12, (source >> 8) & 0xf, source & 0xff].join('.')
        this.value = frame.slice(10)
    }

    /**
     *
     * Control byte=0xBC = 1 0 1 1 11 0 0
     * – 1: 1 bit (0: extended frame, 1: standard frame)
     * – 0: 1 bit (0: reserved)
     * – 1: 1 bit (0: repeat frame on medium in case of a mirror, 1: do not repeat)
     * – 1: 1 bit (0: system broadcast, 1: broadcast)
     * – 3: 2 bit (priority – 0: system, 1: normal, 2: urgent, 3: low)
     * – 0: 1 bit (ackbowledge request – 0: no ack requested, 1: ack requested)
     * – 0: 1 bit (confirm – 0: no error, 1: error)
     */
    public static controlByte (): number {
        return 0xbc
    }

    /**
     *
     * DRL-Byte=0xe0 = 1 110 0000
     * – 1: 1bit (destination address type – 0: individual address, 1: group address)
     * – 6: 3bit (hop count – 0-7 110: standard)
     * – 0: 4bit (extended frame format – 0000: standard frame)
     */
    public static dlrByte (): number {
        return 0xe0
    }

    private static hiLo (v: number) {
        return [v >> 8, v & 0xff]
    }

    public getPacketType (): CemiPacketType {
        return this.frame.readUint8(9) >> 7 & 0x1
    }

    public isSequenced (): boolean {
        return (this.frame.readUint8(9) >> 6 & 0x1) === CemiSequenceType.Sequenced
    }

    public getSequence (): number {
        return this.frame.readUint8(9) >> 2 & 0x0f
    }

    public getService (): APCI {
        return this.frame.readUint16BE(9) >> 6 & 0x0f
    }

    public getDataByteZero (): number {
        return this.frame.readUint8(10) & 0x3f
    }

    public static groupValueRead (code: KnxCemiCode, source: string, target: string): Buffer {
        const [sa, sb, sc] = source.split('.')
        const [ta, tb, tc] = target.split('/')

        const [sourceHi, sourceLo] = this.hiLo((+sa << 12) + (+sb << 8) + +sc)
        const [targetHi, targetLo] = this.hiLo((+ta << 11) + (+tb << 8) + +tc)

        return Buffer.from([code, 0x00, 0xbc, 0xe0, sourceHi, sourceLo, targetHi, targetLo, 1, 0x00, 0x00])
    }

    public static groupValueWrite (code: KnxCemiCode, source: string, target: string, value: Buffer): Buffer {
        const [sa, sb, sc] = source.split('.')
        const [ta, tb, tc] = target.split('/')

        const [sourceHi, sourceLo] = this.hiLo((+sa << 12) + (+sb << 8) + +sc)
        const [targetHi, targetLo] = this.hiLo((+ta << 11) + (+tb << 8) + +tc)

        return Buffer.concat([Buffer.from([code, 0x00, 0xbc, 0xe0, sourceHi, sourceLo, targetHi, targetLo, value.length, 0x00, 0x80 + (value.readUint8(0) & 0x3f)]), value.slice(1)])
    }

    public static compose (code: KnxCemiCode, source: string, target: string, value: Buffer = Buffer.alloc(0), control = 0xbc, drl = 0xe0): Buffer {
        const [sa, sb, sc] = source.split('.')
        const [ta, tb, tc] = target.split('/')

        const [sourceHi, sourceLo] = this.hiLo((+sa << 12) + (+sb << 8) + +sc)
        const [targetHi, targetLo] = this.hiLo((+ta << 11) + (+tb << 8) + +tc)

        return Buffer.concat([Buffer.from([code, 0x00, control, drl, sourceHi, sourceLo, targetHi, targetLo, value.length, 0x00]), value])
    }
}
