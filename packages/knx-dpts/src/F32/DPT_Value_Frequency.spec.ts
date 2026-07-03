import { createF32 } from './create-f32'
import { DPT_Value_Frequency } from './DPT_Value_Frequency'

describe('DPT_Value_Frequency', () => {
    it('toString uses two decimal places', () => {
        const dp = createF32(DPT_Value_Frequency)
        expect(dp.toString(50.123)).toBe('50.12 Hz')
    })
})
