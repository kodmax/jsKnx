export function fromBuffer(buf: Buffer): number {
    return buf.readInt32BE(1)
}

export function toBuffer(value: number, buf: Buffer): Buffer {
    buf.writeInt32BE(value, 1)
    return buf
}
