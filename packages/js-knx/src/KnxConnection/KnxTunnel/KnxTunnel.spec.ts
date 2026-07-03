import EventEmitter from 'events'
import { KnxCemiCode, KnxServiceId } from '@repo/knx-enums'
import { KnxCemiFrame } from '@repo/knx-message'
import { KnxIpMessage } from '@repo/knx-common'
import { TunnelingFrame } from './message/TunnelingFrame'
import { KnxLinkException } from '@repo/knx-common'
import { KnxTunnel } from './KnxTunnel'

type MockTunnel = EventEmitter & {
    send: jest.Mock
    close: jest.Mock
}

function createMockTunnel(): MockTunnel {
    const tunnel = new EventEmitter() as MockTunnel

    tunnel.send = jest.fn()
    tunnel.close = jest.fn(() => {
        tunnel.emit('close')
    })

    return tunnel
}

const activeTunnels: MockTunnel[] = []

function trackMockTunnel(): MockTunnel {
    const tunnel = createMockTunnel()
    activeTunnels.push(tunnel)

    return tunnel
}

function tunnelOptions(maxConcurrentMessages = 16, maxTelegramsPerSecond = 1000) {
    return { maxConcurrentMessages, maxTelegramsPerSecond }
}

function tunnelResponse(channel: number, seq: number): Buffer {
    return KnxIpMessage.compose(KnxServiceId.TUNNEL_RESPONSE, [TunnelingFrame.compose(channel, seq)]).getBuffer()
}

describe('KnxTunnel', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        activeTunnels.length = 0
    })

    afterEach(() => {
        for (const tunnel of activeTunnels) {
            tunnel.emit('close')
        }

        activeTunnels.length = 0
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    it('queues and sends cEMI frame, resolves on tunnel ACK', async () => {
        const tunnel = trackMockTunnel()
        const knxTunnel = new KnxTunnel(tunnel as never, 3, jest.fn(), tunnelOptions())
        const cemi = KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Request, '0.0.0', '1/2/3')

        const sendPromise = knxTunnel.sendCemiFrame(cemi)
        jest.advanceTimersByTime(1)

        expect(tunnel.send).toHaveBeenCalledTimes(1)

        const sent = KnxIpMessage.decode(tunnel.send.mock.calls[0][0] as Buffer)
        const seq = sent.getBody().readUint8(2)

        tunnel.emit('message', tunnelResponse(3, seq))

        await expect(sendPromise).resolves.toBeUndefined()
    })

    it('retries once before rejecting when ACK is missing', async () => {
        const tunnel = trackMockTunnel()
        const knxTunnel = new KnxTunnel(tunnel as never, 1, jest.fn(), tunnelOptions())
        const sendPromise = knxTunnel.sendCemiFrame(Buffer.from([0x11]))

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
        const tunnel = trackMockTunnel()
        const knxTunnel = new KnxTunnel(tunnel as never, 1, jest.fn(), tunnelOptions())

        tunnel.emit('close')

        await expect(knxTunnel.sendCemiFrame(Buffer.from([0x11]))).rejects.toMatchObject({ code: 'NO_CONNECTION' })
    })

    it('ignores corrupted KNX/IP packets', () => {
        const tunnel = trackMockTunnel()
        const onCemiFrame = jest.fn()
        new KnxTunnel(tunnel as never, 1, onCemiFrame, tunnelOptions())

        tunnel.emit('message', Buffer.from([0x00, 0x00]))

        expect(onCemiFrame).not.toHaveBeenCalled()
        expect(tunnel.send).not.toHaveBeenCalled()
    })

    it('forwards L_Data_Indication to onCemiFrame and sends tunnel ACK', () => {
        const tunnel = trackMockTunnel()
        const onCemiFrame = jest.fn()
        new KnxTunnel(tunnel as never, 2, onCemiFrame, tunnelOptions())

        const cemi = KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '4/5/6', Buffer.from([0x00, 0x01]))
        const packet = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingFrame.compose(2, 9), cemi]).getBuffer()

        tunnel.emit('message', packet)

        expect(tunnel.send).toHaveBeenCalledTimes(1)
        expect(KnxIpMessage.decode(tunnel.send.mock.calls[0][0] as Buffer).getServiceId()).toBe(KnxServiceId.TUNNEL_RESPONSE)
        expect(onCemiFrame).toHaveBeenCalledTimes(1)
        expect(onCemiFrame.mock.calls[0][0].target).toBe('4/5/6')
    })

    it('ignores corrupt cEMI inside valid tunnel request', () => {
        const tunnel = trackMockTunnel()
        const onCemiFrame = jest.fn()
        new KnxTunnel(tunnel as never, 2, onCemiFrame, tunnelOptions())

        const packet = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingFrame.compose(2, 1), Buffer.from([0x00])]).getBuffer()

        tunnel.emit('message', packet)

        expect(tunnel.send).toHaveBeenCalledTimes(1)
        expect(onCemiFrame).not.toHaveBeenCalled()
    })

    it('respects maxConcurrentMessages before dequeuing next telegram', async () => {
        const tunnel = trackMockTunnel()
        const knxTunnel = new KnxTunnel(tunnel as never, 1, jest.fn(), tunnelOptions(1))

        knxTunnel.sendCemiFrame(Buffer.from([0x11]))
        knxTunnel.sendCemiFrame(Buffer.from([0x12]))

        jest.advanceTimersByTime(1)
        expect(tunnel.send).toHaveBeenCalledTimes(1)

        const sent = KnxIpMessage.decode(tunnel.send.mock.calls[0][0] as Buffer)
        tunnel.emit('message', tunnelResponse(1, sent.getBody().readUint8(2)))

        jest.advanceTimersByTime(1)
        expect(tunnel.send).toHaveBeenCalledTimes(2)
    })
})

describe('KnxTunnel KnxLinkException', () => {
    afterEach(() => {
        for (const tunnel of activeTunnels) {
            tunnel.emit('close')
        }

        activeTunnels.length = 0
    })

    it('uses KnxLinkException for closed connection', async () => {
        jest.useRealTimers()

        const tunnel = trackMockTunnel()
        const knxTunnel = new KnxTunnel(tunnel as never, 1, jest.fn(), tunnelOptions())
        tunnel.emit('close')

        try {
            await knxTunnel.sendCemiFrame(Buffer.from([0x11]))
        } catch (e) {
            expect(e).toBeInstanceOf(KnxLinkException)
        }
    })
})
