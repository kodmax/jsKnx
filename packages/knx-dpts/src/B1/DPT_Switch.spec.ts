import { createB1 } from './create-b1'
import { DPT_Switch } from './DPT_Switch'

describe('DPT_Switch', () => {
    it('toString without value shows address and type', () => {
        const dp = createB1(DPT_Switch)
        expect(dp.toString()).toBe('2/0/4 (1.001)')
    })

    it('toString formats on/off', () => {
        const dp = createB1(DPT_Switch)
        expect(dp.toString(1)).toBe('on')
        expect(dp.toString(0)).toBe('off')
    })
})
