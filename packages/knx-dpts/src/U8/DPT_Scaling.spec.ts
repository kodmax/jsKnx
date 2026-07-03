import { DPT_Scaling } from './DPT_Scaling'

describe('DPT_Scaling', () => {
    describe('write', () => {
        it('100', () => {
            expect(DPT_Scaling.toBuffer(100, Buffer.alloc(2))).toEqual(Buffer.from([0x00, 255]))
        })
        it('99', () => {
            expect(DPT_Scaling.toBuffer(99, Buffer.alloc(2))).toEqual(Buffer.from([0x00, 0xfc]))
        })
        it('31', () => {
            expect(DPT_Scaling.toBuffer(31, Buffer.alloc(2))).toEqual(Buffer.from([0x00, 0x4f]))
        })
        it('1', () => {
            expect(DPT_Scaling.toBuffer(1, Buffer.alloc(2))).toEqual(Buffer.from([0x00, 0x03]))
        })
        it('0', () => {
            expect(DPT_Scaling.toBuffer(0, Buffer.alloc(2))).toEqual(Buffer.from([0x00, 0]))
        })
    })

    describe('decode', () => {
        it('100', () => {
            expect(DPT_Scaling.fromBuffer(Buffer.from([0x00, 0xff]))).toEqual(100)
        })
        it('99', () => {
            expect(DPT_Scaling.fromBuffer(Buffer.from([0x00, 0xfc]))).toEqual(99)
        })
        it('99', () => {
            expect(DPT_Scaling.fromBuffer(Buffer.from([0x00, 0x4f]))).toEqual(31)
        })
        it('1', () => {
            expect(DPT_Scaling.fromBuffer(Buffer.from([0x00, 0x03]))).toEqual(1)
        })
        it('0', () => {
            expect(DPT_Scaling.fromBuffer(Buffer.from([0x00, 0x00]))).toEqual(0)
        })
    })
})
