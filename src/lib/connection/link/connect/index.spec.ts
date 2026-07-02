import EventEmitter from 'events'
import { KnxConnectionType, KnxLayer, KnxCemiCode } from '../../../enums'
import { KnxCemiFrame } from '../../../message'
import { KnxLinkException } from '../../../types'
import connect from './connect'
import { messageHandler } from './message-handler'
import { tunnelRequest } from './tunnel-request'
import { OnCemiFrame } from './message-handler'

jest.mock('./message-handler')
jest.mock('./tunnel-request')

const messageHandlerMock = messageHandler as jest.MockedFunction<typeof messageHandler>
const tunnelRequestMock = tunnelRequest as jest.MockedFunction<typeof tunnelRequest>

function connectionResponseBuffer(): Buffer {
    const buf = Buffer.alloc(22)

    buf.writeUInt16BE(0x0610, 0)
    buf.writeUInt16BE(0x0206, 2)
    buf.writeUInt16BE(buf.length, 4)
    buf.writeUint8(5, 6)
    buf.writeUint8(0, 7)
    buf.writeUint8(192, 10)
    buf.writeUint8(168, 11)
    buf.writeUint8(0, 12)
    buf.writeUint8(8, 13)
    buf.writeUInt16BE(3671, 14)
    buf.writeUInt16BE((1 << 12) + (2 << 8) + 3, 18)

    return buf
}

describe('connect', () => {
    const options = {
        events: new EventEmitter(),
        maxConcurrentMessages: 16,
        maxTelegramsPerSecond: 24,
        readTimeout: 10000,
        port: 3671,
        maxRetry: 0,
        retryPause: 1000,
        connectionTimeout: 10000
    }

    beforeEach(() => {
        messageHandlerMock.mockReset()
        tunnelRequestMock.mockReset()
    })

    it('returns link info and wires messageHandler callback to events bus', async () => {
        const gateway = new EventEmitter()
        const tunnel = new EventEmitter()
        const sendCemiFrame = jest.fn().mockResolvedValue(undefined)
        let onCemiFrame: OnCemiFrame = () => {}

        messageHandlerMock.mockImplementation((_tunnel, _channel, _maxConcurrent, _maxRate, callback) => {
            onCemiFrame = callback
            return sendCemiFrame
        })

        tunnelRequestMock.mockResolvedValue(connectionResponseBuffer())
        Object.assign(tunnel, {
            address: () => ({ address: '192.168.0.9', port: 3672, family: 'IPv4' })
        })

        const linkInfo = await connect(options, gateway as never, tunnel as never, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

        expect(linkInfo.channel).toBe(5)
        expect(linkInfo.gatewayAddress).toBe('1.2.3')
        expect(linkInfo.ip).toBe('192.168.0.8')
        expect(linkInfo.port).toBe(3671)
        expect(linkInfo.sendCemiFrame).toBe(sendCemiFrame)
        expect(messageHandlerMock).toHaveBeenCalledWith(tunnel, 5, 16, 24, expect.any(Function))

        const cemiFrame = KnxCemiFrame.decode(KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '1/2/3', Buffer.from([0x00, 0x01])))
        const received = new Promise(resolve => options.events.once('cemi-frame', resolve))
        onCemiFrame(cemiFrame)

        await expect(received).resolves.toBe(cemiFrame)
    })

    it('emits error event and rethrows when tunnelRequest fails', async () => {
        const gateway = new EventEmitter()
        const tunnel = new EventEmitter()
        const errorListener = jest.fn()

        options.events.on('error', errorListener)
        tunnelRequestMock.mockRejectedValue(new KnxLinkException('CONNECTION_TIMEOUT', 'timeout', {}))
        Object.assign(tunnel, {
            address: () => ({ address: '192.168.0.9', port: 3672, family: 'IPv4' })
        })

        await expect(connect(options, gateway as never, tunnel as never, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)).rejects.toMatchObject({
            code: 'CONNECTION_TIMEOUT'
        })

        expect(errorListener).toHaveBeenCalledWith(expect.objectContaining({ code: 'CONNECTION_TIMEOUT' }))
    })
})
