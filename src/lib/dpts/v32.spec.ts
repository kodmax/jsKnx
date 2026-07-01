import EventEmitter from 'events'
import { KnxLink, KnxLinkOptions } from '../connection'
import { DPT_ActiveEnergy } from './v32'

function createV32<T>(DataType: new (address: string, link: KnxLink, options: KnxLinkOptions) => T): T {
    const link = { sendCemiFrame: jest.fn().mockResolvedValue(undefined) } as unknown as KnxLink
    const options = { events: new EventEmitter(), readTimeout: 1000 } as KnxLinkOptions

    return new DataType('4/1/0', link, options)
}

describe('DPT V32 classes', () => {
    describe('DPT_ActiveEnergy', () => {
        it('toString includes Wh unit', () => {
            const dp = createV32(DPT_ActiveEnergy)
            expect(dp.toString(12345)).toBe('12345 Wh')
        })

        it('toString without value shows address', () => {
            const dp = createV32(DPT_ActiveEnergy)
            expect(dp.toString()).toBe('4/1/0 (13.010)')
        })
    })
})
