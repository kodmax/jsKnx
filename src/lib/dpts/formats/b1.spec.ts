import { B1 } from './b1'

describe('B1', () => {
    describe('fromBuffer', () => {
        it('reads bit 0 as value', () => {
            expect(B1.fromBuffer(Buffer.from([0x01]))).toBe(1)
            expect(B1.fromBuffer(Buffer.from([0x00]))).toBe(0)
        })

        it('ignores upper bits', () => {
            expect(B1.fromBuffer(Buffer.from([0xfe]))).toBe(0)
            expect(B1.fromBuffer(Buffer.from([0xff]))).toBe(1)
        })
    })

    describe('toBuffer', () => {
        it('writes 1 as 0x01', () => {
            expect(B1.toBuffer(1, Buffer.alloc(1))).toEqual(Buffer.from([0x01]))
        })

        it('writes 0 as 0x00', () => {
            expect(B1.toBuffer(0, Buffer.alloc(1))).toEqual(Buffer.from([0x00]))
        })

        it('treats only LSB as boolean when writing', () => {
            expect(B1.toBuffer(2, Buffer.alloc(1))).toEqual(Buffer.from([0x00]))
            expect(B1.toBuffer(99, Buffer.alloc(1))).toEqual(Buffer.from([0x01]))
        })
    })

    describe('round-trip', () => {
        it.each([0, 1])('preserves %i', value => {
            const buf = B1.toBuffer(value, Buffer.alloc(1))
            expect(B1.fromBuffer(buf)).toBe(value)
        })
    })
})
