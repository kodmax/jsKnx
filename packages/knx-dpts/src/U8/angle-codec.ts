export function fromBuffer(buf: Buffer): number {
    return Math.round((buf.readUint8(1) / 255) * 360)
}

export function toBuffer(value: number, buf: Buffer): Buffer {
    buf.writeUint8(Math.round((value / 360) * 255), 1)
    return buf
}
