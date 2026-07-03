import { DPT_HVACMode } from './DPT_HVACMode'

describe('DPT_HVACMode', () => {
    it('exposes mode constants', () => {
        expect(DPT_HVACMode.AUTO).toBe(0)
        expect(DPT_HVACMode.COMFORT).toBe(1)
        expect(DPT_HVACMode.FROST_PROTECTION).toBe(4)
        expect(DPT_HVACMode.FROST_PROTECION).toBe(DPT_HVACMode.FROST_PROTECTION)
    })
})
