import EventEmitter from 'events'
import { KnxLink, KnxLinkOptions } from '../connection'
import { DPT_Bool, DPT_Enable, DPT_Switch, DPT_State, DPT_UpDown } from './b1'

function createB1<T>(DataType: new (address: string, link: KnxLink, options: KnxLinkOptions) => T, address = '2/0/4'): T {
    const link = { sendCemiFrame: jest.fn().mockResolvedValue(undefined) } as unknown as KnxLink
    const options = { events: new EventEmitter(), readTimeout: 1000 } as KnxLinkOptions

    return new DataType(address, link, options)
}

describe('DPT B1 classes', () => {
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

    describe('DPT_Bool', () => {
        it('toString formats true/false', () => {
            const dp = createB1(DPT_Bool)
            expect(dp.toString(1)).toBe('true')
            expect(dp.toString(0)).toBe('false')
        })
    })

    describe('DPT_State', () => {
        it('toString formats active/inactive', () => {
            const dp = createB1(DPT_State)
            expect(dp.toString(1)).toBe('active')
            expect(dp.toString(0)).toBe('inactive')
        })
    })

    describe('DPT_Enable', () => {
        it('toString formats enable/disable', () => {
            const dp = createB1(DPT_Enable)
            expect(dp.toString(1)).toBe('enable')
            expect(dp.toString(0)).toBe('disable')
        })
    })

    describe('DPT_UpDown', () => {
        it('toString formats up/down', () => {
            const dp = createB1(DPT_UpDown)
            expect(dp.toString(0)).toBe('up')
            expect(dp.toString(1)).toBe('down')
        })
    })
})
