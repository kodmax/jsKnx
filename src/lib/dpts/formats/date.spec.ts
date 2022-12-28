import { fromBuffer, toBuffer } from './date'

describe('Date', () => {
    describe('write', () => {
        it('date', () => {
            expect(toBuffer('2020-02-02', Buffer.alloc(4))).toEqual(Buffer.from([0x00, 2, 2, 20]))
        })

        it('date', () => {
            expect(toBuffer('1990-01-01', Buffer.alloc(4))).toEqual(Buffer.from([0x00, 1, 1, 90]))
        })

        it('date', () => {
            expect(toBuffer('1999-04-31', Buffer.alloc(4))).toEqual(Buffer.from([0x00, 31, 4, 99]))
        })

        it('date', () => {
            expect(toBuffer('2089-12-31', Buffer.alloc(4))).toEqual(Buffer.from([0x00, 31, 12, 89]))
        })

        it('date', () => {
            expect(toBuffer('2000-05-05', Buffer.alloc(4))).toEqual(Buffer.from([0x00, 5, 5, 0]))
        })
    })

    describe('decode', () => {
        it('date', () => {
            expect(fromBuffer(Buffer.from([0x00, 1, 2, 3]))).toEqual([1, 2, 2003])
        })

        it('date', () => {
            expect(fromBuffer(Buffer.from([0x00, 4, 5, 6]))).toEqual([4, 5, 2006])
        })

        it('date', () => {
            expect(fromBuffer(Buffer.from([0x00, 7, 8, 89]))).toEqual([7, 8, 2089])
        })

        it('date', () => {
            expect(fromBuffer(Buffer.from([0x00, 10, 11, 90]))).toEqual([10, 11, 1990])
        })

        it('date', () => {
            expect(fromBuffer(Buffer.from([0x00, 12, 1, 99]))).toEqual([12, 1, 1999])
        })

        it('date', () => {
            expect(fromBuffer(Buffer.from([0x00, 2, 3, 0]))).toEqual([2, 3, 2000])
        })

        it('date', () => {
            expect(fromBuffer(Buffer.from([0x00, 4, 5, 20]))).toEqual([4, 5, 2020])
        })
    })
})
