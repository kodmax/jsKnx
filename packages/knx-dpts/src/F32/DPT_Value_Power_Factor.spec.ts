import { createF32 } from './create-f32'
import { DPT_Value_Power_Factor } from './DPT_Value_Power_Factor'

describe('DPT_Value_Power_Factor', () => {
    it('toString omits unit', () => {
        const dp = createF32(DPT_Value_Power_Factor)
        expect(dp.toString(0.95)).toBe('0.95')
    })
})
