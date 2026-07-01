import { fromBuffer, toBuffer } from './v32'

describe('V32', () => {
    describe('fromBuffer / toBuffer', () => {
        it('round-trips zero', () => {
            const buf = Buffer.alloc(5)
            toBuffer(0, buf)
            expect(fromBuffer(buf)).toBe(0)
        })

        it('round-trips positive integer', () => {
            const buf = Buffer.alloc(5)
            toBuffer(123456789, buf)
            expect(fromBuffer(buf)).toBe(123456789)
        })

        it('round-trips negative integer', () => {
            const buf = Buffer.alloc(5)
            toBuffer(-987654, buf)
            expect(fromBuffer(buf)).toBe(-987654)
        })

        it('round-trips max int32', () => {
            const buf = Buffer.alloc(5)
            toBuffer(2 ** 31 - 1, buf)
            expect(fromBuffer(buf)).toBe(2 ** 31 - 1)
        })

        it('writes at offset 1 leaving byte 0 untouched', () => {
            const buf = Buffer.from([0xaa, 0, 0, 0, 0])
            toBuffer(42, buf)
            expect(buf.readUint8(0)).toBe(0xaa)
            expect(fromBuffer(buf)).toBe(42)
        })
    })
})
