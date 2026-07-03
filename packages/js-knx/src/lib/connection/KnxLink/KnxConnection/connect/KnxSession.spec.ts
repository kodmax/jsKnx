import EventEmitter from 'events'
import { Socket } from 'dgram'
import { KnxConnectionType, KnxLayer, KnxServiceId } from '@repo/knx-enums'
import { KnxIpMessage } from '../../../../message'
import connect from './connect'
import { KnxSession } from './KnxSession'
import { InternalLinkInfo } from '../../types'
import { KnxTransport } from './KnxTransport'

jest.mock('./connect')

const connectMock = connect as jest.MockedFunction<typeof connect>

type MockSocket = EventEmitter & {
    close: jest.Mock
    send: jest.Mock
    address: jest.Mock
}

function createMockSocket(): MockSocket {
    const socket = new EventEmitter() as MockSocket

    socket.close = jest.fn(() => {
        socket.emit('close')
        return socket as unknown as Socket
    })
    socket.send = jest.fn((_buffer: Buffer, callback?: (error: Error | null, bytes?: number) => void) => {
        callback?.(null, _buffer.length)
    })
    socket.address = jest.fn(() => ({
        address: '192.168.0.8',
        port: 3671,
        family: 'IPv4'
    }))

    return socket
}

function knxIpBuffer(serviceId: KnxServiceId): Buffer {
    return KnxIpMessage.compose(serviceId, []).getBuffer()
}

function linkInfo(gateway: MockSocket, tunnel: MockSocket): InternalLinkInfo {
    return {
        gateway: gateway as unknown as Socket,
        tunnel: tunnel as unknown as Socket,
        connectionType: KnxConnectionType.TUNNEL_CONNECTION,
        individualAddress: '1.1.1',
        channel: 1,
        layer: KnxLayer.LINK_LAYER,
        port: 3671,
        ip: '192.168.0.8'
    }
}

function createMockTransport(gateway: MockSocket, tunnel: MockSocket): KnxTransport {
    return {
        getGateway: () => gateway as unknown as Socket,
        getTunnel: () => tunnel as unknown as Socket,
        close: jest.fn()
    } as unknown as KnxTransport
}

describe('KnxSession', () => {
    const options = {
        maxConcurrentMessages: 16,
        maxTelegramsPerSecond: 24,
        readTimeout: 10000,
        port: 3671,
        maxRetry: 0,
        retryPause: 1000,
        connectionTimeout: 10000
    }

    const onCemiFrame = jest.fn()

    beforeEach(() => {
        connectMock.mockReset()
        onCemiFrame.mockReset()
    })

    describe('startSession', () => {
        it('creates session from connect handshake', async () => {
            const gateway = createMockSocket()
            const tunnel = createMockSocket()
            const transport = createMockTransport(gateway, tunnel)

            connectMock.mockResolvedValue(linkInfo(gateway, tunnel))

            const session = await KnxSession.startSession(transport, options, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, onCemiFrame)

            expect(connectMock).toHaveBeenCalledWith(options, gateway, tunnel, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)
            expect(session.getLinkInfo()).toEqual({
                connectionType: KnxConnectionType.TUNNEL_CONNECTION,
                individualAddress: '1.1.1',
                channel: 1,
                layer: KnxLayer.LINK_LAYER,
                port: 3671,
                ip: '192.168.0.8'
            })
        })
    })

    describe('onDisconnectRequest', () => {
        it('fires callback on gateway DISCONNECT_REQUEST', async () => {
            const gateway = createMockSocket()
            const tunnel = createMockSocket()
            const transport = createMockTransport(gateway, tunnel)

            connectMock.mockResolvedValue(linkInfo(gateway, tunnel))

            const session = await KnxSession.startSession(transport, options, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, onCemiFrame)
            const onDisconnectRequest = jest.fn()

            session.onDisconnectRequest(onDisconnectRequest)
            gateway.emit('message', knxIpBuffer(KnxServiceId.DISCONNECT_REQUEST))

            expect(onDisconnectRequest).toHaveBeenCalledTimes(1)
        })

        it('ignores other gateway messages', async () => {
            const gateway = createMockSocket()
            const tunnel = createMockSocket()
            const transport = createMockTransport(gateway, tunnel)

            connectMock.mockResolvedValue(linkInfo(gateway, tunnel))

            const session = await KnxSession.startSession(transport, options, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, onCemiFrame)
            const onDisconnectRequest = jest.fn()

            session.onDisconnectRequest(onDisconnectRequest)
            gateway.emit('message', knxIpBuffer(KnxServiceId.DISCONNECT_RESPONSE))

            expect(onDisconnectRequest).not.toHaveBeenCalled()
        })
    })

    describe('onDisconnectResponse', () => {
        it('fires callback on gateway DISCONNECT_RESPONSE', async () => {
            const gateway = createMockSocket()
            const tunnel = createMockSocket()
            const transport = createMockTransport(gateway, tunnel)

            connectMock.mockResolvedValue(linkInfo(gateway, tunnel))

            const session = await KnxSession.startSession(transport, options, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, onCemiFrame)
            const onDisconnectResponse = jest.fn()

            session.onDisconnectResponse(onDisconnectResponse)
            gateway.emit('message', knxIpBuffer(KnxServiceId.DISCONNECT_RESPONSE))

            expect(onDisconnectResponse).toHaveBeenCalledTimes(1)
        })
    })

    describe('requestDisconnect', () => {
        it('sends DISCONNECT_REQUEST with channel and hpai', async () => {
            const gateway = createMockSocket()
            const tunnel = createMockSocket()
            const transport = createMockTransport(gateway, tunnel)

            connectMock.mockResolvedValue(linkInfo(gateway, tunnel))

            const session = await KnxSession.startSession(transport, options, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, onCemiFrame)

            await session.requestDisconnect()

            expect(gateway.send).toHaveBeenCalled()
            const sentMessage = KnxIpMessage.decode(gateway.send.mock.calls[0][0] as Buffer)
            expect(sentMessage.getServiceId()).toBe(KnxServiceId.DISCONNECT_REQUEST)
        })
    })
})
