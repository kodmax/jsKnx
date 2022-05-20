import { KnxCemiCode } from "../enums"

function decodeAddress (address: number) {
    return [address >> 12, (address >> 8) & 0xf, address & 0xff]
}
type NewType = Buffer

export class KnxCemiFrame {
    public readonly source: string
    public readonly target: string
    public readonly value: Buffer

    public constructor(private readonly frame: Buffer) {
        if (frame.readUint8(0) !== KnxCemiCode ["L_Data.ind"]) {
            throw new Error("Not a cEMI frame")
        }

        const source = frame.readUint16BE(4)
        const target = frame.readUint16BE(6)

        this.target = [(target >> 11) & 0xf, (target >> 8) & 0x7, target & 0xff].join("/")
        this.source = [source >> 12, (source >> 8) & 0xf, source & 0xff].join(".")
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
    public static controlByte(): number {        
        return 0xbc
    }

    /**
     * 
     * DRL-Byte=0xe0 = 1 110 0000
     * – 1: 1bit (destination address type – 0: individual address, 1: group address)
     * – 6: 3bit (hop count – 0-7 110: standard)
     * – 0: 4bit (extended frame format – 0000: standard frame)
     */
    public static dlrByte(): number { 
        return 0xe0
    }

    private static hiLo(v: number) {
        return [v >> 8, v & 0xff]
    }

    public static compose(code: KnxCemiCode, source: string, target: string, value: Buffer, control: number = 0xbc, drl: number = 0xe0): Buffer {
        const [ sa, sb, sc ] = source.split('.')
        const [ ta, tb, tc ] = target.split('/')

        const [ sourceHi, sourceLo ] = this.hiLo((+sa << 12) + (+sb << 8) + +sc)
        const [ targetHi, targetLo ] = this.hiLo((+ta << 11) + (+tb << 8) + +tc)

        const frame = Buffer.concat([Buffer.from([code, 0x00, control, drl, sourceHi, sourceLo, targetHi, targetLo, 0x01 + value.length, 0x00, 0x80]), value])
        return frame
    }
}