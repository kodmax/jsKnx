import { U8 } from './U8'

describe('U8 format', () => {
    it('fromBuffer reads value at byte 1', () => {
        expect(U8.fromBuffer(Buffer.from([0x00, 42]))).toBe(42)
    })

    it('toBuffer writes value at byte 1', () => {
        expect(U8.toBuffer(7, Buffer.alloc(2))).toEqual(Buffer.from([0x00, 7]))
    })

    it('round-trips 0 and 255', () => {
        for (const value of [0, 1, 127, 255]) {
            expect(U8.fromBuffer(U8.toBuffer(value, Buffer.alloc(2)))).toBe(value)
        }
    })
})
