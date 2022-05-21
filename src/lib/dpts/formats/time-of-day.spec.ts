import { fromBuffer, toBuffer } from "./time-of-day"

describe("TimeOfDay", () => {
    describe("write", () => {
        it("time", () => {
            expect(toBuffer("Mon 15:42:07", Buffer.alloc(4))).toEqual(Buffer.from([0x00, 0x2f, 0x2a, 0x07]))
        })
        
        it("time", () => {
            expect(toBuffer("Tue 23:11:34", Buffer.alloc(4))).toEqual(Buffer.from([0x00, 0x57, 0x0b, 0x22]))
        })
        
        it("time", () => {
            expect(toBuffer("Wed 10:41:59", Buffer.alloc(4))).toEqual(Buffer.from([0x00, 0x6a, 0x29, 0x3b]))
        })
        
        it("time", () => {
            expect(toBuffer("Fri 09:44:12", Buffer.alloc(4))).toEqual(Buffer.from([0x00, 0xa9, 0x2c, 0x0c]))
        })

        it("no day", () => {
            expect(toBuffer("11:30:00", Buffer.alloc(4))).toEqual(Buffer.from([0x00, 0x0b, 0x1e, 0x00]))
        })

        it("no seconds", () => {
            expect(toBuffer("12:15", Buffer.alloc(4))).toEqual(Buffer.from([0x00, 12, 15, 0]))
        })

        it("no zeros", () => {
            expect(toBuffer("7:12:0", Buffer.alloc(4))).toEqual(Buffer.from([0x00, 7, 12, 0]))
        })
    })
    describe("decode", () => {
        it("time", () => {
            expect(fromBuffer(Buffer.from([0x00, 0x2f, 0x2a, 0x07]))).toEqual([1, 15, 42, 7])
        })
        
        it("time", () => {
            expect(fromBuffer(Buffer.from([0x00, 0x57, 0x0b, 0x22]))).toEqual([2, 23, 11, 34])
        })
        
        it("time", () => {
            expect(fromBuffer(Buffer.from([0x00, 0x6a, 0x29, 0x3b]))).toEqual([3, 10, 41, 59])
        })
        
        it("time", () => {
            expect(fromBuffer(Buffer.from([0x00, 0xa9, 0x2c, 0x0c]))).toEqual([5, 9, 44, 12])
        })

        it("no day", () => {
            expect(fromBuffer(Buffer.from([0x00, 0x0b, 0x1e, 0x00]))).toEqual([0, 11, 30, 0])
        })

        it("no seconds", () => {
            expect(fromBuffer(Buffer.from([0x00, 12, 15, 0]))).toEqual([0, 12, 15, 0])
        })

        it("no zeros", () => {
            expect(fromBuffer(Buffer.from([0x00, 7, 12, 0]))).toEqual([0, 7, 12, 0])
        })
    })
})