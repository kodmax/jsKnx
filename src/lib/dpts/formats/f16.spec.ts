import { toBuffer, fromBuffer } from './f16'

describe('Float16', () => {
    describe('fromBuffer', () => {

        it('should read float number', () => {
            expect(fromBuffer(Buffer.from([0, 0x0c, 0x68]))).toEqual(22.56)
        })

        it('should read float number', () => {
            expect(fromBuffer(Buffer.from([0, 0x00, 0x00]))).toEqual(0)
        })

        it('should read float number', () => {
            expect(fromBuffer(Buffer.from([0, 0xff, 0xff]))).toEqual(-670760.96)
        })
    })

    describe('fromBuffer', () => {

        it('should write float number', () => {
            expect(toBuffer(22.56, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x0c, 0x68]))
        })

        it('should write float number', () => {
            expect(toBuffer(0, Buffer.alloc(3))).toEqual(Buffer.from([0, 0x00, 0x00]))
        })

        it('should write float number', () => {
            expect(toBuffer(-670760.96, Buffer.alloc(3))).toEqual(Buffer.from([0, 0xff, 0xff]))
        })
    })
})
