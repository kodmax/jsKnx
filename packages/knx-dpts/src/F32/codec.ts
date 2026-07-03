export function fromBuffer(buf: Buffer): number {
    return buf.readFloatBE(1)
}

export function toBuffer(value: number, buf: Buffer): Buffer {
    buf.writeFloatBE(value, 1)
    return buf
}
