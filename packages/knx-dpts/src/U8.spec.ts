import { DPT_HVACMode, DPT_Scaling, DPT_Percent_U8 } from './U8'

describe('DPT_HVACMode', () => {
    it('exposes mode constants', () => {
        expect(DPT_HVACMode.AUTO).toBe(0)
        expect(DPT_HVACMode.COMFORT).toBe(1)
        expect(DPT_HVACMode.FROST_PROTECTION).toBe(4)
        expect(DPT_HVACMode.FROST_PROTECION).toBe(DPT_HVACMode.FROST_PROTECTION)
    })
})

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
