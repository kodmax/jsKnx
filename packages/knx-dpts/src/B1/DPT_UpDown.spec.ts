import { createB1 } from './create-b1'
import { DPT_Enable } from './DPT_Enable'

describe('DPT_Enable', () => {
    it('toString formats enable/disable', () => {
        const dp = createB1(DPT_Enable)
        expect(dp.toString(1)).toBe('enable')
        expect(dp.toString(0)).toBe('disable')
    })
})
