import { KnxLinkException } from '@repo/knx-common'

export function fromBuffer(buf: Buffer): number {
    const f16 = buf.readUint16BE(1)
    const s = f16 & 0x8000

    const m = s ? (f16 & 0x07ff) - 0x0800 : f16 & 0x07ff
    const e = 1 << ((f16 >> 11) & 0x0f)

    return m * e * 0.01
}

export function toBuffer(value: number, buf: Buffer): Buffer {
    const s = value < 0 ? 1 : 0
    value = Math.abs(value)

    let m = Math.abs(value * 100)
    let e = 0

    while (m > 0x07ff) {
        m /= 2
        e++
    }

    if (e > 15) {
        throw new KnxLinkException('INVALID_VALUE', 'Float16: Value Out of Range: ' + value, {
            value
        })
    }

    buf.writeUint16BE((s << 15) + (e << 11) + Math.round(s ? 2048 - m : m), 1)
    return buf
}
