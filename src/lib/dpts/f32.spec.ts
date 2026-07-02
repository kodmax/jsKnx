import { KnxLink, RequiredKnxLinkOptions } from '../connection'
import { DPT_Value_Electric_Current, DPT_Value_Frequency, DPT_Value_Power, DPT_Value_Power_Factor } from './f32'

function createF32<T>(DataType: new (address: string, link: KnxLink, options: RequiredKnxLinkOptions) => T): T {
    const link = { sendCemiFrame: jest.fn().mockResolvedValue(undefined) } as unknown as KnxLink
    const options = { readTimeout: 1000 } as RequiredKnxLinkOptions

    return new DataType('3/1/1', link, options)
}

describe('DPT F32 classes', () => {
    describe('DPT_Value_Power', () => {
        it('toString includes unit', () => {
            const dp = createF32(DPT_Value_Power)
            expect(dp.toString(1234.5)).toBe('1234.5000 W')
        })
    })

    describe('DPT_Value_Frequency', () => {
        it('toString uses two decimal places', () => {
            const dp = createF32(DPT_Value_Frequency)
            expect(dp.toString(50.123)).toBe('50.12 Hz')
        })
    })

    describe('DPT_Value_Electric_Current', () => {
        it('toString uses three decimal places', () => {
            const dp = createF32(DPT_Value_Electric_Current)
            expect(dp.toString(0.4567)).toBe('0.457 A')
        })
    })

    describe('DPT_Value_Power_Factor', () => {
        it('toString omits unit', () => {
            const dp = createF32(DPT_Value_Power_Factor)
            expect(dp.toString(0.95)).toBe('0.95')
        })
    })
})
