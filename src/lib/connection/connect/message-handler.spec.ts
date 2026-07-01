import EventEmitter from 'events'
import { KnxCemiCode, KnxServiceId } from '../../enums'
import { KnxCemiFrame, KnxIpMessage, TunnelingRequest } from '../../message'
import { KnxLinkException } from '../../types'
import { messageHandler } from './message-handler'

type MockTunnel = EventEmitter & {
    send: jest.Mock
    close: jest.Mock
}

function createMockTunnel(): MockTunnel {
    const tunnel = new EventEmitter() as MockTunnel

    tunnel.send = jest.fn()
    tunnel.close = jest.fn()

    return tunnel
}

function tunnelResponse(channel: number, seq: number): Buffer {
    return KnxIpMessage.compose(KnxServiceId.TUNNEL_RESPONSE, [TunnelingRequest.compose(channel, seq)]).getBuffer()
}

describe('messageHandler', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('queues and sends cEMI frame, resolves on tunnel ACK', async () => {
        const tunnel = createMockTunnel()
        const sendCemi = messageHandler(tunnel as never, 3, 16, 1000, jest.fn())
        const cemi = KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Request, '0.0.0', '1/2/3')

        const sendPromise = sendCemi(cemi)
        jest.advanceTimersByTime(1)

        expect(tunnel.send).toHaveBeenCalledTimes(1)

        const sent = KnxIpMessage.decode(tunnel.send.mock.calls[0][0] as Buffer)
        const seq = sent.getBody().readUint8(2)

        tunnel.emit('message', tunnelResponse(3, seq))

        await expect(sendPromise).resolves.toBeUndefined()
    })

    it('retries once before rejecting when ACK is missing', async () => {
        const tunnel = createMockTunnel()
        const sendCemi = messageHandler(tunnel as never, 1, 16, 1000, jest.fn())
        const sendPromise = sendCemi(Buffer.from([0x11]))

        jest.advanceTimersByTime(1)
        expect(tunnel.send).toHaveBeenCalledTimes(1)

        jest.advanceTimersByTime(1000)
        expect(tunnel.send).toHaveBeenCalledTimes(2)

        jest.advanceTimersByTime(1000)

        await expect(sendPromise).rejects.toMatchObject({
            code: 'ACK_TIMEOUT',
            details: { channel: 1 }
        })
        expect(tunnel.close).toHaveBeenCalled()
    })

    it('throws NO_CONNECTION after tunnel is closed', async () => {
        const tunnel = createMockTunnel()
        const sendCemi = messageHandler(tunnel as never, 1, 16, 1000, jest.fn())

        tunnel.emit('close')

        await expect(sendCemi(Buffer.from([0x11]))).rejects.toMatchObject({ code: 'NO_CONNECTION' })
    })

    it('ignores corrupted KNX/IP packets', () => {
        const tunnel = createMockTunnel()
        const onCemiFrame = jest.fn()
        messageHandler(tunnel as never, 1, 16, 1000, onCemiFrame)

        tunnel.emit('message', Buffer.from([0x00, 0x00]))

        expect(onCemiFrame).not.toHaveBeenCalled()
        expect(tunnel.send).not.toHaveBeenCalled()
    })

    it('forwards L_Data_Indication to onCemiFrame and sends tunnel ACK', () => {
        const tunnel = createMockTunnel()
        const onCemiFrame = jest.fn()
        messageHandler(tunnel as never, 2, 16, 1000, onCemiFrame)

        const cemi = KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '4/5/6', Buffer.from([0x00, 0x01]))
        const packet = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingRequest.compose(2, 9), cemi]).getBuffer()

        tunnel.emit('message', packet)

        expect(tunnel.send).toHaveBeenCalledTimes(1)
        expect(KnxIpMessage.decode(tunnel.send.mock.calls[0][0] as Buffer).getServiceId()).toBe(KnxServiceId.TUNNEL_RESPONSE)
        expect(onCemiFrame).toHaveBeenCalledTimes(1)
        expect(onCemiFrame.mock.calls[0][0].target).toBe('4/5/6')
    })

    it('ignores corrupt cEMI inside valid tunnel request', () => {
        const tunnel = createMockTunnel()
        const onCemiFrame = jest.fn()
        messageHandler(tunnel as never, 2, 16, 1000, onCemiFrame)

        const packet = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingRequest.compose(2, 1), Buffer.from([0x00])]).getBuffer()

        tunnel.emit('message', packet)

        expect(tunnel.send).toHaveBeenCalledTimes(1)
        expect(onCemiFrame).not.toHaveBeenCalled()
    })

    it('respects maxConcurrentMessages before dequeuing next telegram', async () => {
        const tunnel = createMockTunnel()
        const sendCemi = messageHandler(tunnel as never, 1, 1, 1000, jest.fn())

        sendCemi(Buffer.from([0x11]))
        sendCemi(Buffer.from([0x12]))

        jest.advanceTimersByTime(1)
        expect(tunnel.send).toHaveBeenCalledTimes(1)

        const sent = KnxIpMessage.decode(tunnel.send.mock.calls[0][0] as Buffer)
        tunnel.emit('message', tunnelResponse(1, sent.getBody().readUint8(2)))

        jest.advanceTimersByTime(1)
        expect(tunnel.send).toHaveBeenCalledTimes(2)
    })
})

describe('messageHandler KnxLinkException', () => {
    it('uses KnxLinkException for closed connection', async () => {
        jest.useRealTimers()

        const tunnel = createMockTunnel()
        const sendCemi = messageHandler(tunnel as never, 1, 16, 1000, jest.fn())
        tunnel.emit('close')

        try {
            await sendCemi(Buffer.from([0x11]))
        } catch (e) {
            expect(e).toBeInstanceOf(KnxLinkException)
        }
    })
})
