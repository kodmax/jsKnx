import { DPT_Percent_U8 } from './DPT_Percent_U8'

describe('DPT_Percent_U8', () => {
    describe('write', () => {
        it('255', () => {
            expect(DPT_Percent_U8.toBuffer(255, Buffer.alloc(2))).toEqual(Buffer.from([0x00, 255]))
        })
        it('100', () => {
            expect(DPT_Percent_U8.toBuffer(100, Buffer.alloc(2))).toEqual(Buffer.from([0x00, 100]))
        })
        it('1', () => {
            expect(DPT_Percent_U8.toBuffer(1, Buffer.alloc(2))).toEqual(Buffer.from([0x00, 1]))
        })
        it('0', () => {
            expect(DPT_Percent_U8.toBuffer(0, Buffer.alloc(2))).toEqual(Buffer.from([0x00, 0]))
        })
    })

    describe('decode', () => {
        it('255', () => {
            expect(DPT_Percent_U8.fromBuffer(Buffer.from([0x00, 255]))).toEqual(255)
        })
        it('100', () => {
            expect(DPT_Percent_U8.fromBuffer(Buffer.from([0x00, 100]))).toEqual(100)
        })
        it('1', () => {
            expect(DPT_Percent_U8.fromBuffer(Buffer.from([0x00, 1]))).toEqual(1)
        })
        it('0', () => {
            expect(DPT_Percent_U8.fromBuffer(Buffer.from([0x00, 0]))).toEqual(0)
        })
    })
})
