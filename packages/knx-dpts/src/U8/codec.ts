export function fromBuffer(buf: Buffer): number {
    return buf.readUint8(1)
}

export function toBuffer(value: number, buf: Buffer): Buffer {
    buf.writeUint8(value, 1)
    return buf
}
