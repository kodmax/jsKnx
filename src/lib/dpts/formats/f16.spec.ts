import { toBuffer, fromBuffer } from './f16'

describe('Float16', () => {
    describe('fromBuffer', () => {
        describe('positive numbers', () => {
            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x0c, 0x68]))).toEqual(22.56)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x00, 0x00]))).toEqual(0)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x00, 0x94]))).toEqual(1.48)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x01, 0x99]))).toEqual(4.09)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x03, 0xe8]))).toEqual(10)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x2e, 0x7f]))).toEqual(532.16)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x3e, 0x1a]))).toEqual(1999.3600000000001)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x4f, 0xa1]))).toEqual(9999.36)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x67, 0x68]))).toEqual(77660.16)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x7f, 0xfe]))).toEqual(670433.28)
            })
        })

        describe('negative numbers', () => {
            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0xf8, 0x01]))).toEqual(-670760.96)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x81, 0x06]))).toEqual(-17.86)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x81, 0x84]))).toEqual(-16.6)
            })

            it('should read float number', () => {
                expect(fromBuffer(Buffer.from([0, 0x87, 0x9c]))).toEqual(-1)
            })
        })
    })

    describe('toBuffer', () => {
        describe('positive numbers', () => {
            it('should write float number', () => {
                expect(toBuffer(532.48, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x2e, 0x80]))
            })

            it('should write float number', () => {
                expect(toBuffer(1999.3600000000001, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x3e, 0x1a]))
            })

            it('should write float number', () => {
                expect(toBuffer(9999.36, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x4f, 0xa1]))
            })

            it('should write float number', () => {
                expect(toBuffer(532.16, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x2e, 0x7f]))
            })

            it('should write float number', () => {
                expect(toBuffer(77660.16, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x67, 0x68]))
            })

            it('should write float number', () => {
                expect(toBuffer(0, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x00, 0x00]))
            })

            it('should write float number', () => {
                expect(toBuffer(22.56, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x0c, 0x68]))
            })

            it('should write float number', () => {
                expect(toBuffer(1.48, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x00, 0x94]))
            })

            it('should write float number', () => {
                expect(toBuffer(4.09, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x01, 0x99]))
            })
        })

        describe('negative numbers', () => {
            it('should write float number', () => {
                expect(toBuffer(-1, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x87, 0x9c]))
            })

            it('should write float number', () => {
                expect(toBuffer(-0, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x00, 0x00]))
            })

            it('should write float number', () => {
                expect(toBuffer(-670760, Buffer.alloc(3))).toEqual(Buffer.from([0, 0xf8, 0x01]))
            })

            it('should write float number', () => {
                expect(toBuffer(-17.86, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x81, 0x06]))
            })

            it('should write float number', () => {
                expect(toBuffer(-16.6, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x81, 0x84]))
            })
        })
    })
})
