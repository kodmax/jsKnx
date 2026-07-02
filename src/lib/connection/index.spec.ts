import EventEmitter from 'events'
import { createSocket, Socket } from 'dgram'
import { KnxConnection } from './KnxConnection'
import { KnxConnectionType, KnxLayer, KnxServiceId } from '../enums'
import { KnxLinkException } from '../types'
import { connectSockets } from './link/connect/connect-sockets'
import connect from './link/connect'
import { ConnectionSockets } from './link/LinkInfo'
import { KnxIpMessage } from '../message'

jest.mock('./link/connect/connect-sockets')
jest.mock('./link/connect')

const connectSocketsMock = connectSockets as jest.MockedFunction<typeof connectSockets>
const connectMock = connect as jest.MockedFunction<typeof connect>
const RETRY_PAUSE_MS = 1000
const DISCONNECT_TIMEOUT_MS = 30_000
const realSetTimeout = global.setTimeout.bind(global)

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

function blockReconnectTimeout(): jest.SpiedFunction<typeof setTimeout> {
    return jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay, ...args) => {
        if (delay === RETRY_PAUSE_MS) {
            return 0 as unknown as ReturnType<typeof setTimeout>
        }

        return realSetTimeout(fn, delay, ...args)
    })
}

function accelerateDisconnectTimeout(): jest.SpiedFunction<typeof setTimeout> {
    return jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay, ...args) => {
        if (delay === DISCONNECT_TIMEOUT_MS) {
            return realSetTimeout(() => (fn as () => void)(), 0)
        }

        if (delay === RETRY_PAUSE_MS) {
            return 0 as unknown as ReturnType<typeof setTimeout>
        }

        return realSetTimeout(fn, delay, ...args)
    })
}

async function waitForDisconnectPending(): Promise<void> {
    await new Promise<void>(resolve => setImmediate(resolve))
}

describe('KnxConnection', () => {
    const options = {
        events: new EventEmitter(),
        maxConcurrentMessages: 16,
        maxTelegramsPerSecond: 24,
        readTimeout: 10000,
        port: 3671,
        maxRetry: 0,
        retryPause: RETRY_PAUSE_MS,
        connectionTimeout: 10000
    }

    async function setupConnected(): Promise<{
        connection: KnxConnection
        gateway: MockSocket
        tunnel: MockSocket
    }> {
        const gateway = createMockSocket()
        const tunnel = createMockSocket()

        connectSocketsMock.mockResolvedValue([gateway as unknown as Socket, tunnel as unknown as Socket])
        connectMock.mockImplementation(async (_options, gw, tun) => ({
            gateway: gw,
            tunnel: tun,
            sendCemiFrame: jest.fn(),
            connectionType: KnxConnectionType.TUNNEL_CONNECTION,
            gatewayAddress: '1.1.1',
            channel: 1,
            layer: KnxLayer.LINK_LAYER,
            port: 3671,
            ip: '192.168.0.8'
        }))

        const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

        await connection.connect()

        return { connection, gateway, tunnel }
    }

    beforeEach(() => {
        connectSocketsMock.mockReset()
        connectMock.mockReset()
    })

    describe('connect', () => {
        it('throws CONNECTION_ALREADY_ESTABLISHED when linkInfo is set', async () => {
            const gateway = createSocket('udp4')
            const tunnel = createSocket('udp4')
            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            ;(connection as unknown as { linkInfo: object }).linkInfo = {
                gateway,
                tunnel,
                sendCemiFrame: jest.fn(),
                connectionType: KnxConnectionType.TUNNEL_CONNECTION,
                gatewayAddress: '1.1.1',
                channel: 1,
                layer: KnxLayer.LINK_LAYER,
                port: 3671,
                ip: '192.168.0.8'
            }

            await expect(connection.connect()).rejects.toMatchObject({
                code: 'CONNECTION_ALREADY_ESTABLISHED'
            } satisfies Partial<KnxLinkException>)

            expect(connectSocketsMock).not.toHaveBeenCalled()

            gateway.close()
            tunnel.close()
        })

        it('throws CONNECTION_IN_PROGRESS while connect is in progress', async () => {
            connectSocketsMock.mockImplementation(async () => new Promise(() => {}))

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            void connection.connect()

            await expect(connection.connect()).rejects.toMatchObject({
                code: 'CONNECTION_IN_PROGRESS'
            } satisfies Partial<KnxLinkException>)

            expect(connectSocketsMock).toHaveBeenCalledTimes(1)
        })

        it('resets connecting after connectSockets failure', async () => {
            connectSocketsMock.mockRejectedValue(new Error('socket error'))

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            await expect(connection.connect()).rejects.toThrow('socket error')

            expect((connection as unknown as { connecting: boolean }).connecting).toBe(false)
        })
    })

    describe('auto reconnect', () => {
        it('schedules reconnect after session teardown', () => {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(() => 0 as unknown as ReturnType<typeof setTimeout>)

            const gateway = createSocket('udp4')
            const tunnel = createSocket('udp4')

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            ;(connection as unknown as { linkInfo: object }).linkInfo = {
                gateway,
                tunnel,
                sendCemiFrame: jest.fn(),
                connectionType: KnxConnectionType.TUNNEL_CONNECTION,
                gatewayAddress: '1.1.1',
                channel: 1,
                layer: KnxLayer.LINK_LAYER,
                port: 3671,
                ip: '192.168.0.8'
            }

            ;(connection as unknown as { teardown: () => void; scheduleReconnect: () => void }).teardown()
            ;(connection as unknown as { scheduleReconnect: () => void }).scheduleReconnect()

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), options.retryPause)

            setTimeoutSpy.mockRestore()
        })

        it('does not reconnect after explicit disconnect', () => {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(() => 0 as unknown as ReturnType<typeof setTimeout>)

            const gateway = createSocket('udp4')
            const tunnel = createSocket('udp4')

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            ;(connection as unknown as { explicitDisconnect: boolean }).explicitDisconnect = true
            ;(connection as unknown as { linkInfo: object }).linkInfo = {
                gateway,
                tunnel,
                sendCemiFrame: jest.fn(),
                connectionType: KnxConnectionType.TUNNEL_CONNECTION,
                gatewayAddress: '1.1.1',
                channel: 1,
                layer: KnxLayer.LINK_LAYER,
                port: 3671,
                ip: '192.168.0.8'
            }

            ;(connection as unknown as { teardown: () => void; scheduleReconnect: () => void }).teardown()
            ;(connection as unknown as { scheduleReconnect: () => void }).scheduleReconnect()

            expect(setTimeoutSpy).not.toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })

        it('does not reconnect after failed connect teardown', () => {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(() => 0 as unknown as ReturnType<typeof setTimeout>)

            const gateway = createSocket('udp4')
            const tunnel = createSocket('udp4')

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            ;(connection as unknown as { teardown: (sockets: ConnectionSockets) => void }).teardown({ gateway, tunnel })

            expect(setTimeoutSpy).not.toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })
    })

    describe('session lifecycle', () => {
        it('schedules reconnect when gateway socket closes', async () => {
            const setTimeoutSpy = blockReconnectTimeout()

            const { connection, gateway } = await setupConnected()
            setTimeoutSpy.mockClear()

            gateway.emit('close')

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), options.retryPause)
            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))

            setTimeoutSpy.mockRestore()
        })

        it('schedules reconnect when tunnel socket closes', async () => {
            const setTimeoutSpy = blockReconnectTimeout()

            const { tunnel } = await setupConnected()
            setTimeoutSpy.mockClear()

            tunnel.emit('close')

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), options.retryPause)

            setTimeoutSpy.mockRestore()
        })

        it('schedules reconnect on gateway DISCONNECT_REQUEST', async () => {
            const setTimeoutSpy = blockReconnectTimeout()

            const { connection, gateway } = await setupConnected()
            setTimeoutSpy.mockClear()

            gateway.emit('message', knxIpBuffer(KnxServiceId.DISCONNECT_REQUEST))

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), options.retryPause)
            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))

            setTimeoutSpy.mockRestore()
        })

        it('tears down on gateway DISCONNECT_RESPONSE without reconnect', async () => {
            const setTimeoutSpy = blockReconnectTimeout()

            const { connection, gateway } = await setupConnected()
            setTimeoutSpy.mockClear()

            gateway.emit('message', knxIpBuffer(KnxServiceId.DISCONNECT_RESPONSE))

            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))
            expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), RETRY_PAUSE_MS)

            setTimeoutSpy.mockRestore()
        })

        it('closes both sockets on unexpected close', async () => {
            const { connection, gateway, tunnel } = await setupConnected()

            gateway.emit('close')

            expect(gateway.close).toHaveBeenCalled()
            expect(tunnel.close).toHaveBeenCalled()
            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))
        })
    })

    describe('disconnect', () => {
        it('sends DISCONNECT_REQUEST and resolves on DISCONNECT_RESPONSE', async () => {
            const setTimeoutSpy = blockReconnectTimeout()

            const { connection, gateway } = await setupConnected()
            setTimeoutSpy.mockClear()

            const disconnectPromise = connection.disconnect()
            await waitForDisconnectPending()
            setTimeoutSpy.mockClear()

            expect(gateway.send).toHaveBeenCalled()
            const sentMessage = KnxIpMessage.decode(gateway.send.mock.calls[0][0] as Buffer)
            expect(sentMessage.getServiceId()).toBe(KnxServiceId.DISCONNECT_REQUEST)

            gateway.emit('message', knxIpBuffer(KnxServiceId.DISCONNECT_RESPONSE))

            await disconnectPromise

            expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), RETRY_PAUSE_MS)
            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))

            setTimeoutSpy.mockRestore()
        })

        it('resolves after timeout when DISCONNECT_RESPONSE is missing', async () => {
            const setTimeoutSpy = accelerateDisconnectTimeout()

            const { connection } = await setupConnected()

            await connection.disconnect()

            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))

            setTimeoutSpy.mockRestore()
        })
    })
})
