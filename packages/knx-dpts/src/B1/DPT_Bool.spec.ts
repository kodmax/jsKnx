import { createB1 } from './create-b1'
import { DPT_Bool } from './DPT_Bool'

describe('DPT_Bool', () => {
    it('toString formats true/false', () => {
        const dp = createB1(DPT_Bool)
        expect(dp.toString(1)).toBe('true')
        expect(dp.toString(0)).toBe('false')
    })
})
