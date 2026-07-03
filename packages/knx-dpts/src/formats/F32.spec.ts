import { fromBuffer, toBuffer } from './F32'

describe('F32', () => {
    describe('fromBuffer / toBuffer', () => {
        it('round-trips zero', () => {
            const buf = Buffer.alloc(5)
            toBuffer(0, buf)
            expect(fromBuffer(buf)).toBe(0)
        })

        it('round-trips positive float', () => {
            const buf = Buffer.alloc(5)
            toBuffer(230.5, buf)
            expect(fromBuffer(buf)).toBeCloseTo(230.5, 4)
        })

        it('round-trips negative float', () => {
            const buf = Buffer.alloc(5)
            toBuffer(-12.75, buf)
            expect(fromBuffer(buf)).toBeCloseTo(-12.75, 4)
        })

        it('round-trips large value', () => {
            const buf = Buffer.alloc(5)
            toBuffer(99999.125, buf)
            expect(fromBuffer(buf)).toBeCloseTo(99999.125, 2)
        })

        it('writes at offset 1 leaving byte 0 untouched', () => {
            const buf = Buffer.from([0xff, 0, 0, 0, 0])
            toBuffer(1, buf)
            expect(buf.readUint8(0)).toBe(0xff)
            expect(fromBuffer(buf)).toBe(1)
        })
    })
})
