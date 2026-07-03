import { KnxLinkException } from '../KnxLinkException'
import { KnxEventEmitter } from './KnxEventEmitter'

type TestCemiFrame = {
    target: string
    source: string
}

const testFrame: TestCemiFrame = {
    target: '1/2/3',
    source: '1.0.0'
}

describe('KnxEventEmitter', () => {
    it('emit("error") throws when no listeners are registered', () => {
        const events = new KnxEventEmitter<TestCemiFrame>()

        expect(() => events.emit('error', new KnxLinkException('CONNECTION_TIMEOUT', 'timeout', {}))).toThrow()
    })

    it('notifies error listeners', () => {
        const events = new KnxEventEmitter<TestCemiFrame>()
        const listener = jest.fn()
        const error = new KnxLinkException('CONNECTION_TIMEOUT', 'timeout', {})

        events.on('error', listener)
        events.emit('error', error)

        expect(listener).toHaveBeenCalledWith(error)
    })

    it('notifies cemi-frame listeners', () => {
        const events = new KnxEventEmitter<TestCemiFrame>()
        const listener = jest.fn()

        events.on('cemi-frame', listener)
        events.emit('cemi-frame', testFrame)

        expect(listener).toHaveBeenCalledWith(testFrame)
    })

    it('removes listeners with off', () => {
        const events = new KnxEventEmitter<TestCemiFrame>()
        const errorListener = jest.fn()
        const cemiListener = jest.fn()

        events.on('error', errorListener)
        events.on('cemi-frame', cemiListener)
        events.off('error', errorListener)
        events.off('cemi-frame', cemiListener)

        expect(() => events.emit('error', new KnxLinkException('NETWORK_ERROR', 'network', {}))).toThrow()

        events.emit('cemi-frame', testFrame)

        expect(errorListener).not.toHaveBeenCalled()
        expect(cemiListener).not.toHaveBeenCalled()
    })

    it('once invokes listener only once', () => {
        const events = new KnxEventEmitter<TestCemiFrame>()
        const listener = jest.fn()
        const error = new KnxLinkException('CONNECTION_TIMEOUT', 'timeout', {})

        events.once('error', listener)
        events.emit('error', error)
        expect(() => events.emit('error', error)).toThrow()

        expect(listener).toHaveBeenCalledTimes(1)
    })
})
