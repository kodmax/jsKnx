import { createF32 } from './create-f32'
import { DPT_Value_Electric_Current } from './DPT_Value_Electric_Current'

describe('DPT_Value_Electric_Current', () => {
    it('toString uses three decimal places', () => {
        const dp = createF32(DPT_Value_Electric_Current)
        expect(dp.toString(0.4567)).toBe('0.457 A')
    })
})
