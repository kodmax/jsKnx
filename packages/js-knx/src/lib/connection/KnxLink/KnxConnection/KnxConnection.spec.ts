import { Socket } from 'dgram'
import { KnxConnection } from '.'
import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'
import { KnxLinkException } from '../../../types'
import { KnxEventEmitter } from '../KnxEventEmitter'
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
        connectionType: KnxConnectionType.TUNNEL_CONNECTION,
        individualAddress: '1.1.1',
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
            individualAddress: info.individualAddress,
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
    let events: KnxEventEmitter
    const options = {
        maxConcurrentMessages: 16,
        maxTelegramsPerSecond: 24,
        readTimeout: 10000,
        port: 3671,
        maxRetry: 0,
        retryPause: RETRY_PAUSE_MS,
        connectionTimeout: 10000
    }

    function createConnection(): KnxConnection {
        return new KnxConnection(options, '192.168.0.8', KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, events)
    }

    async function setupConnected(): Promise<{
        connection: KnxConnection
        session: MockKnxSession
        transport: MockKnxTransport
    }> {
        const transport = createMockTransport()
        const session = createMockSession()

        openTransportMock.mockResolvedValue(transport as unknown as KnxTransport)
        startSessionMock.mockImplementation(async () => session as unknown as KnxSession)

        const connection = createConnection()

        await connection.connect()

        expect(transport.onClose).toHaveBeenCalled()
        expect(session.onDisconnectRequest).toHaveBeenCalled()
        expect(session.onDisconnectResponse).toHaveBeenCalled()

        return { connection, session, transport }
    }

    beforeEach(() => {
        events = new KnxEventEmitter()
        openTransportMock.mockReset()
        startSessionMock.mockReset()
        startSessionMock.mockImplementation(async () => createMockSession() as unknown as KnxSession)
    })

    describe('connect', () => {
        it('throws CONNECTION_ALREADY_ESTABLISHED when session is active', async () => {
            const connection = createConnection()

            ;(connection as unknown as { session?: KnxSession }).session = createMockSession() as unknown as KnxSession

            await expect(connection.connect()).rejects.toMatchObject({
                code: 'CONNECTION_ALREADY_ESTABLISHED'
            } satisfies Partial<KnxLinkException>)

            expect(openTransportMock).not.toHaveBeenCalled()
        })

        it('throws CONNECTION_IN_PROGRESS while connect is in progress', async () => {
            openTransportMock.mockImplementation(async () => new Promise(() => {}))

            const connection = createConnection()

            void connection.connect()

            await expect(connection.connect()).rejects.toMatchObject({
                code: 'CONNECTION_IN_PROGRESS'
            } satisfies Partial<KnxLinkException>)

            expect(openTransportMock).toHaveBeenCalledTimes(1)
        })

        it('resets connecting after transport open failure', async () => {
            openTransportMock.mockRejectedValue(new Error('socket error'))
            events.on('error', () => {})

            const connection = createConnection()

            await expect(connection.connect()).rejects.toThrow('socket error')

            expect((connection as unknown as { connecting: boolean }).connecting).toBe(false)
        })

        it('starts session after transport is open', async () => {
            const transport = createMockTransport()

            openTransportMock.mockResolvedValue(transport as unknown as KnxTransport)
            startSessionMock.mockResolvedValue(createMockSession() as unknown as KnxSession)

            const connection = createConnection()

            await connection.connect()

            expect(startSessionMock).toHaveBeenCalledWith(transport, options, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER, expect.any(Function))
            expect(connection.getLinkInfo().individualAddress).toBe('1.1.1')
        })

        it('emits error when transport open fails', async () => {
            const errorListener = jest.fn()

            events.on('error', errorListener)
            openTransportMock.mockRejectedValue(new Error('socket error'))

            const connection = createConnection()

            await expect(connection.connect()).rejects.toThrow('socket error')

            expect(errorListener).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('socket error') }))
        })

        it('emits error when startSession fails', async () => {
            const errorListener = jest.fn()

            events.on('error', errorListener)
            openTransportMock.mockResolvedValue(createMockTransport() as unknown as KnxTransport)
            startSessionMock.mockRejectedValue(new KnxLinkException('CONNECTION_TIMEOUT', 'timeout', {}))

            const connection = createConnection()

            await expect(connection.connect()).rejects.toMatchObject({
                code: 'CONNECTION_TIMEOUT'
            })

            expect(errorListener).toHaveBeenCalledTimes(1)
            expect(errorListener).toHaveBeenCalledWith(expect.objectContaining({ code: 'CONNECTION_TIMEOUT' }))
        })
    })

    describe('lifecycle events', () => {
        it('emits connecting, network-connection-established, starting-session, and connected on successful connect', async () => {
            const connecting = jest.fn()
            const networkConnectionEstablished = jest.fn()
            const startingSession = jest.fn()
            const connected = jest.fn()

            events.on('connecting', connecting)
            events.on('network-connection-established', networkConnectionEstablished)
            events.on('starting-session', startingSession)
            events.on('connected', connected)

            openTransportMock.mockResolvedValue(createMockTransport() as unknown as KnxTransport)

            await createConnection().connect()

            const endpoint = { ip: '192.168.0.8', port: 3671 }

            expect(connecting).toHaveBeenCalledWith(endpoint)
            expect(networkConnectionEstablished).toHaveBeenCalledWith(endpoint)
            expect(startingSession).toHaveBeenCalledWith(endpoint)
            expect(connected).toHaveBeenCalledWith(
                expect.objectContaining({
                    individualAddress: '1.1.1',
                    ip: '192.168.0.8',
                    port: 3671
                })
            )
            expect(connecting.mock.invocationCallOrder[0]).toBeLessThan(networkConnectionEstablished.mock.invocationCallOrder[0]!)
            expect(networkConnectionEstablished.mock.invocationCallOrder[0]).toBeLessThan(startingSession.mock.invocationCallOrder[0]!)
            expect(startingSession.mock.invocationCallOrder[0]).toBeLessThan(connected.mock.invocationCallOrder[0]!)
        })

        it('does not emit starting-session when transport open fails', async () => {
            const startingSession = jest.fn()

            events.on('error', () => {})
            events.on('starting-session', startingSession)
            openTransportMock.mockRejectedValue(new Error('socket error'))

            await expect(createConnection().connect()).rejects.toThrow('socket error')

            expect(startingSession).not.toHaveBeenCalled()
        })

        it('emits starting-session on each startSession retry', async () => {
            jest.useFakeTimers()
            const startingSession = jest.fn()

            events.on('error', () => {})
            events.on('starting-session', startingSession)
            openTransportMock.mockResolvedValue(createMockTransport() as unknown as KnxTransport)

            let attempts = 0
            startSessionMock.mockImplementation(async () => {
                attempts++

                if (attempts < 3) {
                    throw new KnxLinkException('CONNECTION_ERROR', 'Error connecting to KNX/IP Gateway: NO_MORE_CHANNELS', { knxErrorCode: 37 })
                }

                return createMockSession() as unknown as KnxSession
            })

            const connection = new KnxConnection(
                { ...options, maxRetry: 5, retryPause: 1000 },
                '192.168.0.8',
                KnxConnectionType.TUNNEL_CONNECTION,
                KnxLayer.LINK_LAYER,
                events
            )

            const connectPromise = connection.connect()

            await jest.advanceTimersByTimeAsync(2000)
            await connectPromise

            expect(startingSession).toHaveBeenCalledTimes(3)
            expect(startingSession).toHaveBeenCalledWith({ ip: '192.168.0.8', port: 3671 })

            jest.useRealTimers()
        })

        it('does not emit network-connection-established when transport open fails', async () => {
            const networkConnectionEstablished = jest.fn()

            events.on('error', () => {})
            events.on('network-connection-established', networkConnectionEstablished)
            openTransportMock.mockRejectedValue(new Error('socket error'))

            await expect(createConnection().connect()).rejects.toThrow('socket error')

            expect(networkConnectionEstablished).not.toHaveBeenCalled()
        })

        it('emits disconnected with network-connect-failed when transport open fails', async () => {
            const disconnected = jest.fn()

            events.on('error', () => {})
            events.on('disconnected', disconnected)
            openTransportMock.mockRejectedValue(new Error('socket error'))

            await expect(createConnection().connect()).rejects.toThrow('socket error')

            expect(disconnected).toHaveBeenCalledWith({ reason: 'network-connect-failed' })
        })

        it('emits disconnected with unexpected-socket-close when transport closes unexpectedly', async () => {
            const setTimeoutSpy = blockReconnectTimeout()
            const disconnected = jest.fn()
            const reconnecting = jest.fn()
            const connecting = jest.fn()

            events.on('disconnected', disconnected)
            events.on('reconnecting', reconnecting)
            events.on('connecting', connecting)

            const { transport } = await setupConnected()

            connecting.mockClear()
            transport.triggerClose()

            expect(disconnected).toHaveBeenCalledWith({ reason: 'unexpected-socket-close' })
            expect(reconnecting).toHaveBeenCalledWith({ delayMs: RETRY_PAUSE_MS })
            expect(connecting).not.toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })

        it('does not emit unexpected-socket-close after graceful disconnect teardown', async () => {
            const disconnected = jest.fn()

            events.on('disconnected', disconnected)

            const { connection, session, transport } = await setupConnected()

            const disconnectPromise = connection.disconnect()
            await waitForDisconnectPending()

            session.triggerDisconnectResponse()
            await disconnectPromise

            disconnected.mockClear()
            transport.triggerClose()

            expect(disconnected).not.toHaveBeenCalled()
        })

        it('does not emit unexpected-socket-close after gateway-request teardown', async () => {
            const disconnected = jest.fn()

            events.on('disconnected', disconnected)

            const { session, transport } = await setupConnected()

            session.triggerDisconnectRequest()

            expect(disconnected).toHaveBeenCalledWith({ reason: 'gateway-request' })

            disconnected.mockClear()
            transport.triggerClose()

            expect(disconnected).not.toHaveBeenCalled()
        })

        it('emits disconnected with graceful reason after disconnect response', async () => {
            const disconnected = jest.fn()

            events.on('disconnected', disconnected)

            const { connection, session } = await setupConnected()

            const disconnectPromise = connection.disconnect()
            await waitForDisconnectPending()

            session.triggerDisconnectResponse()
            await disconnectPromise

            expect(disconnected).toHaveBeenCalledWith({ reason: 'graceful' })
        })
    })

    describe('auto reconnect', () => {
        it('schedules reconnect after session teardown', () => {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(() => 0 as unknown as ReturnType<typeof setTimeout>)

            const connection = createConnection()

            ;(connection as unknown as { session?: KnxSession }).session = createMockSession() as unknown as KnxSession

            ;(connection as unknown as { teardown: (reason: string) => void; scheduleReconnect: () => void }).teardown('gateway-request')
            ;(connection as unknown as { scheduleReconnect: () => void }).scheduleReconnect()

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), options.retryPause)

            setTimeoutSpy.mockRestore()
        })

        it('does not reconnect after explicit disconnect', () => {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(() => 0 as unknown as ReturnType<typeof setTimeout>)

            const connection = createConnection()

            ;(connection as unknown as { explicitDisconnect: boolean }).explicitDisconnect = true
            ;(connection as unknown as { session?: KnxSession }).session = createMockSession() as unknown as KnxSession

            ;(connection as unknown as { teardown: (reason: string) => void; scheduleReconnect: () => void }).teardown('gateway-request')
            ;(connection as unknown as { scheduleReconnect: () => void }).scheduleReconnect()

            expect(setTimeoutSpy).not.toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })

        it('does not reconnect after failed connect teardown', () => {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(() => 0 as unknown as ReturnType<typeof setTimeout>)
            const transport = createMockTransport()

            const connection = createConnection()

            ;(connection as unknown as { transport?: KnxTransport }).transport = transport as unknown as KnxTransport
            ;(connection as unknown as { teardown: (reason: string) => void }).teardown('network-connect-failed')

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

        it('tears down with graceful reason on disconnect response after disconnect request', async () => {
            const setTimeoutSpy = blockReconnectTimeout()
            const disconnected = jest.fn()

            events.on('disconnected', disconnected)

            const { connection, session, transport } = await setupConnected()
            setTimeoutSpy.mockClear()

            const disconnectPromise = connection.disconnect()
            await waitForDisconnectPending()

            session.triggerDisconnectResponse()
            await disconnectPromise

            expect(disconnected).toHaveBeenCalledWith({ reason: 'graceful' })
            expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), RETRY_PAUSE_MS)
            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))
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
            const disconnected = jest.fn()

            events.on('disconnected', disconnected)

            const { connection, session, transport } = await setupConnected()

            await connection.disconnect()

            expect(session.requestDisconnect).toHaveBeenCalled()
            expect(disconnected).toHaveBeenCalledWith({ reason: 'disconnect-timeout' })
            expect(transport.close).toHaveBeenCalled()
            expect(() => connection.getLinkInfo()).toThrow(expect.objectContaining({ code: 'NO_CONNECTION' }))

            setTimeoutSpy.mockRestore()
        })
    })
})
