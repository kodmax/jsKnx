import { createB1 } from './create-b1'
import { DPT_State } from './DPT_State'

describe('DPT_State', () => {
    it('toString formats active/inactive', () => {
        const dp = createB1(DPT_State)
        expect(dp.toString(1)).toBe('active')
        expect(dp.toString(0)).toBe('inactive')
    })
})
