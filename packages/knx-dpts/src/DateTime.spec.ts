import { DPT_DateTime, DTStatus } from './DateTime'
import { KnxLinkException } from '@js-knx-internal/types'

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

        it('defaults seconds to 0 when omitted', () => {
            expect(DPT_DateTime.setDateTime('2023-02-08', '20:33', false)).toEqual({
                year: 2023,
                month: 2,
                dayOfMonth: 8,
                hourOfDay: 20,
                minutes: 33,
                seconds: 0,
                status: DTStatus.NWD + DTStatus.NDoW + DTStatus.CLQ + DTStatus.SRC
            })
        })

        it('defaults seconds to 0 for single-digit hour without seconds', () => {
            expect(DPT_DateTime.setDateTime('2023-02-08', '9:05', false).seconds).toBe(0)
        })

        it('rejects hour 24', () => {
            expect(() => DPT_DateTime.setDateTime('2023-02-08', '24:00:00', false)).toThrow(
                expect.objectContaining({ code: 'INVALID_VALUE' } satisfies Partial<KnxLinkException>)
            )
        })

        it('rejects invalid hour 25', () => {
            expect(() => DPT_DateTime.setDateTime('2023-02-08', '25:00:00', false)).toThrow(
                expect.objectContaining({ code: 'INVALID_VALUE' } satisfies Partial<KnxLinkException>)
            )
        })
    })

    describe('setTime', () => {
        it('defaults seconds to 0 when omitted', () => {
            expect(DPT_DateTime.setTime('20:33', false)).toEqual({
                status: DTStatus.NWD + DTStatus.NDoW + DTStatus.CLQ + DTStatus.SRC + DTStatus.ND + DTStatus.NY,
                hourOfDay: 20,
                minutes: 33,
                seconds: 0
            })
        })

        it('rejects hour 24', () => {
            expect(() => DPT_DateTime.setTime('24:00:00', false)).toThrow(
                expect.objectContaining({ code: 'INVALID_VALUE' } satisfies Partial<KnxLinkException>)
            )
        })
    })
})
