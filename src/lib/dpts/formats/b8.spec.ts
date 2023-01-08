import { B8 } from './b8'

describe('B8', () => {
    describe('write', () => {
        it('255', () => {
            expect(B8.toBuffer([1, 1, 1, 1, 1, 1, 1, 1], Buffer.alloc(2))).toEqual(Buffer.from([0x00, 255]))
        })
        it('0', () => {
            expect(B8.toBuffer([0, 0, 0, 0, 0, 0, 0, 0], Buffer.alloc(2))).toEqual(Buffer.from([0x00, 0]))
        })
        it('bit order, 128', () => {
            expect(B8.toBuffer([1, 0, 0, 0, 0, 0, 0, 0], Buffer.alloc(2))).toEqual(Buffer.from([0x00, 128]))
        })
        it('bit order 1', () => {
            expect(B8.toBuffer([0, 0, 0, 0, 0, 0, 0, 1], Buffer.alloc(2))).toEqual(Buffer.from([0x00, 1]))
        })
    })

    describe('decode', () => {
        it('255', () => {
            expect(B8.fromBuffer(Buffer.from([0x00, 255]))).toEqual([1, 1, 1, 1, 1, 1, 1, 1])
        })
        it('0', () => {
            expect(B8.fromBuffer(Buffer.from([0x00, 0]))).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
        })
        it('bit order, 128', () => {
            expect(B8.fromBuffer(Buffer.from([0x00, 128]))).toEqual([1, 0, 0, 0, 0, 0, 0, 0])
        })
        it('bit order 1', () => {
            expect(B8.fromBuffer(Buffer.from([0x00, 1]))).toEqual([0, 0, 0, 0, 0, 0, 0, 1])
        })
    })
})
