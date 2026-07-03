import { sequence } from './sequence'

describe('Tunneling', () => {
    const nextSeq = sequence(255)

    it('sequence must start from 0', () => {
        expect(nextSeq()).toEqual(0)
    })

    it('sequence must be incremented by one', () => {
        for (let seq = 1; seq <= 255; seq++) {
            expect(nextSeq()).toEqual(seq)
        }
    })

    it('sequence must be modulo 256', () => {
        expect(nextSeq()).toEqual(0)
    })
})
