import { createF32 } from './create-f32'
import { DPT_Value_Power } from './DPT_Value_Power'

describe('DPT_Value_Power', () => {
    it('toString includes unit', () => {
        const dp = createF32(DPT_Value_Power)
        expect(dp.toString(1234.5)).toBe('1234.5000 W')
    })
})
