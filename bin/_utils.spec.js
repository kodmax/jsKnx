'use strict'

const { coerceValue, isGateway, parseArgs, resolveDpt } = require('./_utils')

describe('bin/_utils', () => {
    const originalGateway = process.env.KNX_GATEWAY

    afterEach(() => {
        if (originalGateway === undefined) {
            delete process.env.KNX_GATEWAY
        } else {
            process.env.KNX_GATEWAY = originalGateway
        }
    })

    describe('isGateway', () => {
        it('accepts IPv4 addresses', () => {
            expect(isGateway('192.168.0.8')).toBe(true)
        })

        it('rejects group addresses', () => {
            expect(isGateway('2/0/4')).toBe(false)
        })
    })

    describe('parseArgs', () => {
        it('uses explicit gateway from argv', () => {
            expect(parseArgs(['node', 'read.js', '192.168.0.8', '2/0/4', 'Switch'])).toEqual({
                gateway: '192.168.0.8',
                address: '2/0/4',
                dptName: 'Switch',
                value: undefined
            })
        })

        it('uses KNX_GATEWAY when gateway is omitted', () => {
            process.env.KNX_GATEWAY = '10.0.0.1'

            expect(parseArgs(['node', 'read.js', '2/0/4', 'Switch'])).toEqual({
                gateway: '10.0.0.1',
                address: '2/0/4',
                dptName: 'Switch',
                value: undefined
            })
        })

        it('parses write value', () => {
            process.env.KNX_GATEWAY = '10.0.0.1'

            expect(parseArgs(['node', 'write.js', '2/0/4', 'Switch', '1'], { requireValue: true })).toEqual({
                gateway: '10.0.0.1',
                address: '2/0/4',
                dptName: 'Switch',
                value: '1'
            })
        })
    })

    describe('resolveDpt', () => {
        it('resolves short DPT names', () => {
            expect(resolveDpt({ DPT_Switch: class {} }, 'Switch')).toBeDefined()
        })

        it('resolves fully qualified DPT names', () => {
            const Switch = class {}
            expect(resolveDpt({ DPT_Switch: Switch }, 'DPT_Switch')).toBe(Switch)
        })
    })

    describe('coerceValue', () => {
        it('converts numeric strings to numbers', () => {
            expect(coerceValue('1')).toBe(1)
        })

        it('keeps non-numeric strings', () => {
            expect(coerceValue('12:30:00')).toBe('12:30:00')
        })
    })
})
