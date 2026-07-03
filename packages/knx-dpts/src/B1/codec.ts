export function fromBuffer(buf: Buffer): number {
    return buf.readUint8(0) & 0x01
}

export function toBuffer(value: number, buf: Buffer): Buffer {
    buf.writeUint8((value & 0x01) === 1 ? 0x1 : 0x0, 0)
    return buf
}
