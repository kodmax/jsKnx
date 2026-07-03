function getBit(i: number, octet: number): number {
    return octet & (1 << i) ? 1 : 0
}

export function fromBuffer(buf: Buffer): number[] {
    const octet = buf.readUint8(1)

    return [getBit(7, octet), getBit(6, octet), getBit(5, octet), getBit(4, octet), getBit(3, octet), getBit(2, octet), getBit(1, octet), getBit(0, octet)]
}

export function toBuffer(bits: number[], buf: Buffer): Buffer {
    const octet = bits.reduce((a, b, i) => a + (b ? 1 << (7 - i) : 0), 0)
    buf.writeUint8(octet, 1)
    return buf
}
