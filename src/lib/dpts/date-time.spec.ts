import { DPT_DateTime, DTStatus } from './date-time'

describe('DateTime', () => {
    describe('setDateTime', () => {
        it('date and time 1', () => {
            expect(DPT_DateTime.setDateTime('2023-02-08', '20:33:22', true)).toEqual({
                year: 2023,
                month: 2,
                dayOfMonth: 8,
                hourOfDay: 20,
                minutes: 33,
                seconds: 22,
                status: DTStatus.NWD + DTStatus.NDoW + DTStatus.SUTI + DTStatus.CLQ + DTStatus.SRC
            })
        })
    })
})
