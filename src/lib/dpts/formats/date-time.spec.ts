import { fromBuffer, KnxDateTime, toBuffer, DTStatus } from './date-time'

describe('DateTime', () => {
    describe('write', () => {
        it('date and time 1', () => {
            const datetime: KnxDateTime = {
                year: 2023,
                month: 2,
                dayOfMonth: 8,
                hourOfDay: 20,
                minutes: 33,
                seconds: 22,
                dayOfWeek: 3,
                status: 0
            }

            expect(toBuffer(datetime, Buffer.alloc(9))).toEqual(Buffer.from([0x00, 0x7B, 0x02, 0x08, 0x74, 0x21, 0x16, 0x00, 0x00]))
        })

        it('date and time 2', () => {
            const datetime: KnxDateTime = {
                year: 2023,
                month: 2,
                dayOfMonth: 8,
                hourOfDay: 20,
                minutes: 33,
                seconds: 22,
                dayOfWeek: 3,
                status: DTStatus.CLQ + DTStatus.WD
            }

            expect(toBuffer(datetime, Buffer.alloc(9))).toEqual(Buffer.from([0x00, 0x7B, 0x02, 0x08, 0x74, 0x21, 0x16, 0x40, 0x80]))
        })

        it('no year', () => {
            const datetime: KnxDateTime = {
                month: 2,
                dayOfMonth: 8,
                hourOfDay: 20,
                minutes: 33,
                seconds: 22,
                status: DTStatus.CLQ + DTStatus.F + DTStatus.NY,
                dayOfWeek: 3
            }

            expect(toBuffer(datetime, Buffer.alloc(9))).toEqual(Buffer.from([0x00, 0x0, 0x02, 0x08, 0x74, 0x21, 0x16, 0x90, 0x80]))
        })
    })

    describe('decode', () => {
        it('date and time 1', () => {
            const datetime: KnxDateTime = {
                year: 2023,
                month: 2,
                dayOfMonth: 8,
                hourOfDay: 20,
                minutes: 33,
                seconds: 22,
                status: 0,
                dayOfWeek: 3
            }

            expect(fromBuffer(Buffer.from([0x00, 0x7B, 0x02, 0x08, 0x74, 0x21, 0x16, 0x00, 0x00]))).toEqual(datetime)
        })

        it('date and time 2', () => {
            const datetime: KnxDateTime = {
                year: 2023,
                month: 2,
                dayOfMonth: 8,
                hourOfDay: 20,
                minutes: 33,
                seconds: 22,
                dayOfWeek: 3,
                status: DTStatus.CLQ + DTStatus.WD
            }

            expect(fromBuffer(Buffer.from([0x00, 0x7B, 0x02, 0x08, 0x74, 0x21, 0x16, 0x40, 0x80]))).toEqual(datetime)
        })

        it('no year', () => {
            const datetime: KnxDateTime = {
                year: 1900,
                month: 2,
                dayOfMonth: 8,
                hourOfDay: 20,
                minutes: 33,
                seconds: 22,
                status: DTStatus.CLQ + DTStatus.F + DTStatus.NY,
                dayOfWeek: 3
            }

            expect(fromBuffer(Buffer.from([0x00, 0x0, 0x02, 0x08, 0x74, 0x21, 0x16, 0x90, 0x80]))).toEqual(datetime)
        })
    })
})
