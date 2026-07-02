import EventEmitter from 'events'
import { KnxConnectionType, KnxLayer } from '../../enums'
import { KnxConnection } from '..'
import { KnxLink } from './KnxLink'
import { DPT_Switch } from '../../dpts/b1'

jest.mock('./connect/connect-sockets')
jest.mock('./connect')

import { connectSockets } from './connect/connect-sockets'
import connect from './connect'

const connectSocketsMock = connectSockets as jest.MockedFunction<typeof connectSockets>
const connectMock = connect as jest.MockedFunction<typeof connect>

describe('KnxLink', () => {
    beforeEach(() => {
        connectSocketsMock.mockReset()
        connectMock.mockReset()
    })

    it('connect() creates link with default options', async () => {
        const events = new EventEmitter()
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

        const link = await KnxLink.connect('192.168.0.8', { events })

        expect(link.getLinkInfo()).toEqual({
            connectionType: KnxConnectionType.TUNNEL_CONNECTION,
            gatewayAddress: '1.1.1',
            channel: 1,
            layer: KnxLayer.LINK_LAYER,
            port: 3671,
            ip: '192.168.0.8'
        })
    })

    it('getDatapoint() returns configured DPT instance', () => {
        const events = new EventEmitter()
        const connection = {
            getLinkInfo: () => ({ sendCemiFrame: jest.fn() }),
            disconnect: jest.fn()
        } as unknown as KnxConnection

        const link = new KnxLink(connection, {
            events,
            maxConcurrentMessages: 16,
            maxTelegramsPerSecond: 24,
            readTimeout: 10000,
            port: 3671,
            maxRetry: 0,
            retryPause: 1000,
            connectionTimeout: 10000
        })

        const dp = link.getDatapoint({ address: '2/0/4', DataType: DPT_Switch })

        expect(dp.getAddress()).toBe('2/0/4')
        expect(dp.getLink()).toBe(link)
        expect(dp.toString()).toBe('2/0/4 (1.001)')
    })

    it('getDatapoint() runs optional init callback', () => {
        const events = new EventEmitter()
        const connection = {
            getLinkInfo: () => ({ sendCemiFrame: jest.fn() }),
            disconnect: jest.fn()
        } as unknown as KnxConnection

        const link = new KnxLink(connection, {
            events,
            maxConcurrentMessages: 16,
            maxTelegramsPerSecond: 24,
            readTimeout: 10000,
            port: 3671,
            maxRetry: 0,
            retryPause: 1000,
            connectionTimeout: 10000
        })

        const init = jest.fn()
        link.getDatapoint({ address: '2/0/4', DataType: DPT_Switch }, init)

        expect(init).toHaveBeenCalledTimes(1)
    })
})
