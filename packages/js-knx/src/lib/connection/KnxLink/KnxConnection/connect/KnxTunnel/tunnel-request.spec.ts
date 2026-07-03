import EventEmitter from 'events'
import { KnxConnectionType, KnxErrorCode, KnxLayer, KnxServiceId } from '@repo/knx-enums'
import { KnxIpMessage } from '../../../../../message'
import { KnxLinkException } from '../../../../../types'
import { tunnelRequest } from './tunnel-request'

type MockGateway = EventEmitter & {
    send: jest.Mock
    address: jest.Mock
}

function createMockGateway(): MockGateway {
    const gateway = new EventEmitter() as MockGateway

    gateway.send = jest.fn((_buffer: Buffer, callback?: (error: Error | null) => void) => {
        callback?.(null)
    })
    gateway.address = jest.fn(() => ({
        address: '192.168.0.8',
        port: 3671,
        family: 'IPv4'
    }))

    return gateway
}

function connectionResponseBuffer(opts: { errorCode?: number; channel?: number } = {}): Buffer {
    const { errorCode = 0, channel = 5 } = opts
    const buf = Buffer.alloc(22)

    buf.writeUInt16BE(0x0610, 0)
    buf.writeUInt16BE(KnxServiceId.CONNECTION_RESPONSE, 2)
    buf.writeUInt16BE(buf.length, 4)
    buf.writeUint8(channel, 6)
    buf.writeUint8(errorCode, 7)
    buf.writeUint8(192, 10)
    buf.writeUint8(168, 11)
    buf.writeUint8(0, 12)
    buf.writeUint8(8, 13)
    buf.writeUInt16BE(3671, 14)
    buf.writeUInt16BE((1 << 12) + (2 << 8) + 3, 18)

    return buf
}

const tunnelAddress = {
    address: '192.168.0.9',
    port: 3672,
    family: 'IPv4'
}

describe('tunnelRequest', () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    it('resolves with connection response on success', async () => {
        const gateway = createMockGateway()
        const promise = tunnelRequest(gateway as never, tunnelAddress, 5000, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

        await Promise.resolve()
        gateway.emit('message', connectionResponseBuffer({ channel: 7 }))

        await expect(promise).resolves.toEqual(connectionResponseBuffer({ channel: 7 }))
        expect(gateway.send).toHaveBeenCalledTimes(1)
    })

    it('rejects with CONNECTION_ERROR on gateway error code', async () => {
        const gateway = createMockGateway()
        const promise = tunnelRequest(gateway as never, tunnelAddress, 5000, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

        await Promise.resolve()
        gateway.emit('message', connectionResponseBuffer({ errorCode: KnxErrorCode.NO_MORE_CONNECTIONS }))

        await expect(promise).rejects.toMatchObject({
            code: 'CONNECTION_ERROR',
            details: { knxErrorCode: KnxErrorCode.NO_MORE_CONNECTIONS }
        })
    })

    it('rejects with NOT_A_CONNECTION_RESPONSE for unexpected service id', async () => {
        const gateway = createMockGateway()
        const promise = tunnelRequest(gateway as never, tunnelAddress, 5000, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

        await Promise.resolve()
        gateway.emit('message', KnxIpMessage.compose(KnxServiceId.SEARCH_RESPONSE, []).getBuffer())

        await expect(promise).rejects.toMatchObject({ code: 'NOT_A_CONNECTION_RESPONSE' })
    })

    it('rejects with CONNECTION_TIMEOUT when gateway does not respond', async () => {
        jest.useFakeTimers()

        const gateway = createMockGateway()
        const promise = tunnelRequest(gateway as never, tunnelAddress, 2000, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

        await Promise.resolve()
        jest.advanceTimersByTime(2000)

        await expect(promise).rejects.toMatchObject({ code: 'CONNECTION_TIMEOUT' })
    })

    it('propagates send errors from gateway', async () => {
        const gateway = createMockGateway()
        gateway.send.mockImplementation((_buffer: Buffer, callback?: (error: Error | null) => void) => {
            callback?.(new Error('send failed'))
        })

        await expect(tunnelRequest(gateway as never, tunnelAddress, 5000, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)).rejects.toMatchObject({
            code: 'NETWORK_ERROR',
            message: expect.stringContaining('send failed')
        })
    })

    it('composes CONNECTION_REQUEST with tunnel and gateway HPAI', async () => {
        const gateway = createMockGateway()
        const promise = tunnelRequest(gateway as never, tunnelAddress, 5000, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

        await Promise.resolve()
        gateway.emit('message', connectionResponseBuffer())

        await promise

        const sent = gateway.send.mock.calls[0][0] as Buffer
        const message = KnxIpMessage.decode(sent)

        expect(message.getServiceId()).toBe(KnxServiceId.CONNECTION_REQUEST)
        expect(sent.length).toBeGreaterThan(10)
    })
})

describe('KnxLinkException from tunnelRequest', () => {
    it('includes readable message for connection errors', async () => {
        const gateway = createMockGateway()
        const promise = tunnelRequest(gateway as never, tunnelAddress, 5000, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

        await Promise.resolve()
        gateway.emit('message', connectionResponseBuffer({ errorCode: KnxErrorCode.NO_MORE_CHANNELS }))

        try {
            await promise
        } catch (e) {
            expect(e).toBeInstanceOf(KnxLinkException)
            expect((e as KnxLinkException).message).toContain('NO_MORE_CHANNELS')
        }
    })
})
