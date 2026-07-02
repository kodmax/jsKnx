import EventEmitter from 'events'
import { KnxConnectionType, KnxLayer } from '../../enums'
import { KnxConnection } from './KnxConnection'
import { KnxEventEmitter } from './KnxEventEmitter'
import { KnxLink } from './KnxLink'
import { DPT_Switch } from '../../dpts/b1'
import { KnxCemiCode } from '../../enums'
import { KnxCemiFrame } from '../../message'

jest.mock('./KnxConnection/connect/connect-sockets')
jest.mock('./KnxConnection/connect/connect')

import { connectSockets } from './KnxConnection/connect/connect-sockets'
import connect from './KnxConnection/connect/connect'

const connectSocketsMock = connectSockets as jest.MockedFunction<typeof connectSockets>
const connectMock = connect as jest.MockedFunction<typeof connect>

const defaultOptions = {
    maxConcurrentMessages: 16,
    maxTelegramsPerSecond: 24,
    readTimeout: 10000,
    port: 3671,
    maxRetry: 0,
    retryPause: 1000,
    connectionTimeout: 10000
}

function createLink(connection: KnxConnection): KnxLink {
    return new KnxLink(connection, defaultOptions, new KnxEventEmitter())
}

const defaultConnectOptions = {
    onError: jest.fn(),
    onCemiFrame: jest.fn()
}

describe('KnxLink', () => {
    beforeEach(() => {
        connectSocketsMock.mockReset()
        connectMock.mockReset()
    })

    it('connect() creates link with default options', async () => {
        const sendCemiFrame = jest.fn().mockResolvedValue(undefined)
        const gateway = new EventEmitter()
        const tunnel = new EventEmitter()

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockResolvedValue({
            sendCemiFrame,
            gatewayAddress: '1.1.1',
            ip: '192.168.0.8',
            port: 3671,
            connectionType: KnxConnectionType.TUNNEL_CONNECTION,
            channel: 1,
            gateway: gateway as never,
            tunnel: tunnel as never,
            layer: KnxLayer.LINK_LAYER
        })

        const link = await KnxLink.connect('192.168.0.8', defaultConnectOptions)

        expect(link.getLinkInfo()).toEqual({
            connectionType: KnxConnectionType.TUNNEL_CONNECTION,
            gatewayAddress: '1.1.1',
            channel: 1,
            layer: KnxLayer.LINK_LAYER,
            port: 3671,
            ip: '192.168.0.8'
        })
    })

    it('connect() wires onError and onCemiFrame options to link events', async () => {
        const onError = jest.fn()
        const onCemiFrame = jest.fn()
        const gateway = new EventEmitter()
        const tunnel = new EventEmitter()
        const cemiFrame = KnxCemiFrame.decode(KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '1/2/3', Buffer.from([0x00, 0x01])))

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockImplementation(async (_options, _gateway, _tunnel, _connectionType, _layer, frameListener) => {
            frameListener(cemiFrame)

            return {
                sendCemiFrame: jest.fn(),
                gatewayAddress: '1.1.1',
                ip: '192.168.0.8',
                port: 3671,
                connectionType: KnxConnectionType.TUNNEL_CONNECTION,
                channel: 1,
                gateway: gateway as never,
                tunnel: tunnel as never,
                layer: KnxLayer.LINK_LAYER
            }
        })

        const link = await KnxLink.connect('192.168.0.8', { onError, onCemiFrame })

        expect(onCemiFrame).toHaveBeenCalledWith(cemiFrame)

        const error = { code: 'NETWORK_ERROR' } as never
        link.emit('error', error)

        expect(onError).toHaveBeenCalledWith(error)
    })

    it('getDatapoint() returns configured DPT instance', () => {
        const connection = {
            getLinkInfo: () => ({ sendCemiFrame: jest.fn() }),
            disconnect: jest.fn()
        } as unknown as KnxConnection

        const link = createLink(connection)

        const dp = link.getDatapoint({ address: '2/0/4', DataType: DPT_Switch })

        expect(dp.getAddress()).toBe('2/0/4')
        expect(dp.getLink()).toBe(link)
        expect(dp.toString()).toBe('2/0/4 (1.001)')
    })

    it('getDatapoint() runs optional init callback', () => {
        const connection = {
            getLinkInfo: () => ({ sendCemiFrame: jest.fn() }),
            disconnect: jest.fn()
        } as unknown as KnxConnection

        const link = createLink(connection)

        const init = jest.fn()
        link.getDatapoint({ address: '2/0/4', DataType: DPT_Switch }, init)

        expect(init).toHaveBeenCalledTimes(1)
    })

    it('forwards on/off/once/emit to internal event bus', () => {
        const connection = {
            getLinkInfo: () => ({ sendCemiFrame: jest.fn() }),
            disconnect: jest.fn()
        } as unknown as KnxConnection

        const link = createLink(connection)
        const listener = jest.fn()

        link.on('error', listener)

        const error = { code: 'NETWORK_ERROR' } as never
        link.emit('error', error)

        expect(listener).toHaveBeenCalledWith(error)

        link.off('error', listener)
        expect(() => link.emit('error', error)).toThrow()
    })
})
