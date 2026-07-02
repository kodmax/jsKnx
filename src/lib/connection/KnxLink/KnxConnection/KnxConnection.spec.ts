import EventEmitter from 'events'
import { Socket } from 'dgram'
import { KnxConnection } from '.'
import { KnxConnectionType, KnxLayer } from '../../../enums'
import { KnxLinkException } from '../../../types'
import { InternalLinkInfo } from '../types'
import { KnxSession } from './connect/KnxSession'
import { KnxTransport } from './connect/KnxTransport'

jest.mock('./connect/KnxTransport')
jest.mock('./connect/KnxSession')

const openTransportMock = KnxTransport.open as jest.MockedFunction<typeof KnxTransport.open>
const startSessionMock = KnxSession.startSession as jest.MockedFunction<typeof KnxSession.startSession>

const RETRY_PAUSE_MS = 1000
const DISCONNECT_TIMEOUT_MS = 30_000
const realSetTimeout = global.setTimeout.bind(global)

type MockKnxTransport = {
    onClose: jest.Mock
    close: jest.Mock
    triggerClose: () => void
}

type MockKnxSession = {
    onDisconnectRequest: jest.Mock
    onDisconnectResponse: jest.Mock
    getLinkInfo: jest.Mock
    requestDisconnect: jest.Mock
    triggerDisconnectRequest: () => void
    triggerDisconnectResponse: () => void
}

function createMockTransport(): MockKnxTransport {
    let onCloseCb: (() => void) | undefined

    return {
        onClose: jest.fn((cb: () => void) => {
            onCloseCb = cb
        }),
        close: jest.fn(),
        triggerClose: () => onCloseCb?.()
    }
}

function createMockSession(linkInfo?: Partial<InternalLinkInfo>): MockKnxSession {
    let onDisconnectRequestCb: (() => void) | undefined
    let onDisconnectResponseCb: (() => void) | undefined

    const info: InternalLinkInfo = {
        sendCemiFrame: jest.fn(),
        connectionType: KnxConnectionType.TUNNEL_CONNECTION,
        gatewayAddress: '1.1.1',
        channel: 1,
        layer: KnxLayer.LINK_LAYER,
        port: 3671,
        ip: '192.168.0.8',
        gateway: {} as Socket,
        tunnel: {} as Socket,
        ...linkInfo
    }

    return {
        onDisconnectRequest: jest.fn((cb: () => void) => {
            onDisconnectRequestCb = cb
        }),
        onDisconnectResponse: jest.fn((cb: () => void) => {
            onDisconnectResponseCb = cb
        }),
        getLinkInfo: jest.fn(() => ({
            connectionType: info.connectionType,
            gatewayAddress: info.gatewayAddress,
            channel: info.channel,
            layer: info.layer,
            port: info.port,
            ip: info.ip
        })),
        requestDisconnect: jest.fn().mockResolvedValue(undefined),
        triggerDisconnectRequest: () => onDisconnectRequestCb?.(),
        triggerDisconnectResponse: () => onDisconnectResponseCb?.()
    }
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
        session: MockKnxSession
        transport: MockKnxTransport
    }> {
        const transport = createMockTransport()
        const session = createMockSession()

        openTransportMock.mockResolvedValue(transport as unknown as KnxTransport)
        startSessionMock.mockResolvedValue(session as unknown as KnxSession)

        const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

        await connection.connect()

        expect(transport.onClose).toHaveBeenCalled()
        expect(session.onDisconnectRequest).toHaveBeenCalled()
        expect(session.onDisconnectResponse).toHaveBeenCalled()

        return { connection, session, transport }
    }

    beforeEach(() => {
        openTransportMock.mockReset()
        startSessionMock.mockReset()
    })

    describe('connect', () => {
        it('throws CONNECTION_ALREADY_ESTABLISHED when session is active', async () => {
            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            ;(connection as unknown as { session?: KnxSession }).session = createMockSession() as unknown as KnxSession

            await expect(connection.connect()).rejects.toMatchObject({
                code: 'CONNECTION_ALREADY_ESTABLISHED'
            } satisfies Partial<KnxLinkException>)

            expect(openTransportMock).not.toHaveBeenCalled()
        })

        it('throws CONNECTION_IN_PROGRESS while connect is in progress', async () => {
            openTransportMock.mockImplementation(async () => new Promise(() => {}))

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            void connection.connect()

            await expect(connection.connect()).rejects.toMatchObject({
                code: 'CONNECTION_IN_PROGRESS'
            } satisfies Partial<KnxLinkException>)

            expect(openTransportMock).toHaveBeenCalledTimes(1)
        })

        it('resets connecting after transport open failure', async () => {
            openTransportMock.mockRejectedValue(new Error('socket error'))

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            await expect(connection.connect()).rejects.toThrow('socket error')

            expect((connection as unknown as { connecting: boolean }).connecting).toBe(false)
        })

        it('starts session after transport is open', async () => {
            const transport = createMockTransport()

            openTransportMock.mockResolvedValue(transport as unknown as KnxTransport)
            startSessionMock.mockResolvedValue(createMockSession() as unknown as KnxSession)

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            await connection.connect()

            expect(startSessionMock).toHaveBeenCalledWith(transport, options, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, expect.any(Function))
            expect(connection.getLinkInfo().gatewayAddress).toBe('1.1.1')
        })

        it('emits error when transport open fails', async () => {
            const errorListener = jest.fn()

            options.events.on('error', errorListener)
            openTransportMock.mockRejectedValue(new Error('socket error'))

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            await expect(connection.connect()).rejects.toThrow('socket error')

            expect(errorListener).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('socket error') }))
        })

        it('emits error when startSession fails', async () => {
            const errorListener = jest.fn()

            options.events.on('error', errorListener)
            openTransportMock.mockResolvedValue(createMockTransport() as unknown as KnxTransport)
            startSessionMock.mockRejectedValue(new KnxLinkException('CONNECTION_TIMEOUT', 'timeout', {}))

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            await expect(connection.connect()).rejects.toMatchObject({
                code: 'CONNECTION_TIMEOUT'
            })

            expect(errorListener).toHaveBeenCalledTimes(1)
            expect(errorListener).toHaveBeenCalledWith(expect.objectContaining({ code: 'CONNECTION_TIMEOUT' }))
        })
    })

    describe('auto reconnect', () => {
        it('schedules reconnect after session teardown', () => {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(() => 0 as unknown as ReturnType<typeof setTimeout>)

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            ;(connection as unknown as { session?: KnxSession }).session = createMockSession() as unknown as KnxSession

            ;(connection as unknown as { teardown: () => void; scheduleReconnect: () => void }).teardown()
            ;(connection as unknown as { scheduleReconnect: () => void }).scheduleReconnect()

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), options.retryPause)

            setTimeoutSpy.mockRestore()
        })

        it('does not reconnect after explicit disconnect', () => {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(() => 0 as unknown as ReturnType<typeof setTimeout>)

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            ;(connection as unknown as { explicitDisconnect: boolean }).explicitDisconnect = true
            ;(connection as unknown as { session?: KnxSession }).session = createMockSession() as unknown as KnxSession

            ;(connection as unknown as { teardown: () => void; scheduleReconnect: () => void }).teardown()
            ;(connection as unknown as { scheduleReconnect: () => void }).scheduleReconnect()

            expect(setTimeoutSpy).not.toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })

        it('does not reconnect after failed connect teardown', () => {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(() => 0 as unknown as ReturnType<typeof setTimeout>)
            const transport = createMockTransport()

            const connection = new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

            ;(connection as unknown as { transport?: KnxTransport }).transport = transport as unknown as KnxTransport
            ;(connection as unknown as { teardown: () => void }).teardown()

            expect(setTimeoutSpy).not.toHaveBeenCalled()
            expect(transport.close).toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })
    })

    describe('session lifecycle', () => {
        it('schedules reconnect when transport closes', async () => {
            const setTimeoutSpy = blockReconnectTimeout()

            const { connection, transport } = await setupConnected()
            setTimeoutSpy.mockClear()

            transport.triggerClose()

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), options.retryPause)
            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))
            expect(transport.close).toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })

        it('schedules reconnect on session DISCONNECT_REQUEST', async () => {
            const setTimeoutSpy = blockReconnectTimeout()

            const { connection, session, transport } = await setupConnected()
            setTimeoutSpy.mockClear()

            session.triggerDisconnectRequest()

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), options.retryPause)
            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))
            expect(transport.close).toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })

        it('tears down on session DISCONNECT_RESPONSE without reconnect', async () => {
            const setTimeoutSpy = blockReconnectTimeout()

            const { connection, session, transport } = await setupConnected()
            setTimeoutSpy.mockClear()

            session.triggerDisconnectResponse()

            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))
            expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), RETRY_PAUSE_MS)
            expect(transport.close).toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })
    })

    describe('disconnect', () => {
        it('requests session disconnect and resolves on DISCONNECT_RESPONSE', async () => {
            const setTimeoutSpy = blockReconnectTimeout()

            const { connection, session, transport } = await setupConnected()
            setTimeoutSpy.mockClear()

            const disconnectPromise = connection.disconnect()
            await waitForDisconnectPending()
            setTimeoutSpy.mockClear()

            expect(session.requestDisconnect).toHaveBeenCalled()

            session.triggerDisconnectResponse()

            await disconnectPromise

            expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), RETRY_PAUSE_MS)
            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))
            expect(transport.close).toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })

        it('resolves after timeout when DISCONNECT_RESPONSE is missing', async () => {
            const setTimeoutSpy = accelerateDisconnectTimeout()

            const { connection, session, transport } = await setupConnected()

            await connection.disconnect()

            expect(session.requestDisconnect).toHaveBeenCalled()
            expect(transport.close).toHaveBeenCalled()
            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))

            setTimeoutSpy.mockRestore()
        })
    })
})
