import { KnxCemiCode } from '../../enums'
import { KnxCemiFrame } from '../../message'
import { KnxLinkException } from '../../types'
import { KnxEventEmitter } from './KnxEventEmitter'

describe('KnxEventEmitter', () => {
    it('emit("error") throws when no listeners are registered', () => {
        const events = new KnxEventEmitter()

        expect(() => events.emit('error', new KnxLinkException('CONNECTION_TIMEOUT', 'timeout', {}))).toThrow()
    })

    it('notifies error listeners', () => {
        const events = new KnxEventEmitter()
        const listener = jest.fn()
        const error = new KnxLinkException('CONNECTION_TIMEOUT', 'timeout', {})

        events.on('error', listener)
        events.emit('error', error)

        expect(listener).toHaveBeenCalledWith(error)
    })

    it('notifies cemi-frame listeners', () => {
        const events = new KnxEventEmitter()
        const listener = jest.fn()
        const frame = KnxCemiFrame.decode(KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '1/2/3', Buffer.from([0x00, 0x01])))

        events.on('cemi-frame', listener)
        events.emit('cemi-frame', frame)

        expect(listener).toHaveBeenCalledWith(frame)
    })

    it('removes listeners with off', () => {
        const events = new KnxEventEmitter()
        const errorListener = jest.fn()
        const cemiListener = jest.fn()

        events.on('error', errorListener)
        events.on('cemi-frame', cemiListener)
        events.off('error', errorListener)
        events.off('cemi-frame', cemiListener)

        expect(() => events.emit('error', new KnxLinkException('NETWORK_ERROR', 'network', {}))).toThrow()

        events.emit('cemi-frame', KnxCemiFrame.decode(KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '1/2/3', Buffer.from([0x00, 0x01]))))

        expect(errorListener).not.toHaveBeenCalled()
        expect(cemiListener).not.toHaveBeenCalled()
    })

    it('once invokes listener only once', () => {
        const events = new KnxEventEmitter()
        const listener = jest.fn()
        const error = new KnxLinkException('CONNECTION_TIMEOUT', 'timeout', {})

        events.once('error', listener)
        events.emit('error', error)
        expect(() => events.emit('error', error)).toThrow()

        expect(listener).toHaveBeenCalledTimes(1)
    })
})
