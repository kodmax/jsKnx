import EventEmitter from 'events'
import { KnxConnectionType, KnxLayer } from '../../enums'
import { KnxConnection } from './KnxConnection'
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

describe('KnxLink', () => {
    beforeEach(() => {
        connectSocketsMock.mockReset()
        connectMock.mockReset()
    })

    it('connect() warns when no error listener is registered', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const gateway = new EventEmitter()
        const tunnel = new EventEmitter()

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockResolvedValue({
            sendCemiFrame: jest.fn(),
            individualAddress: '1.1.1',
            ip: '192.168.0.8',
            port: 3671,
            connectionType: KnxConnectionType.TUNNEL_CONNECTION,
            channel: 1,
            gateway: gateway as never,
            tunnel: tunnel as never,
            layer: KnxLayer.LINK_LAYER
        })

        const link = new KnxLink('192.168.0.8')
        await link.connect()

        expect(warn).toHaveBeenCalledWith(
            'js-knx: KnxLink has no error listener. Call knx.on("error", …) before connect(), or unhandled errors will crash the process.'
        )

        warn.mockRestore()
    })

    it('connect() does not warn when error listener is registered before connect()', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const gateway = new EventEmitter()
        const tunnel = new EventEmitter()

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockResolvedValue({
            sendCemiFrame: jest.fn(),
            individualAddress: '1.1.1',
            ip: '192.168.0.8',
            port: 3671,
            connectionType: KnxConnectionType.TUNNEL_CONNECTION,
            channel: 1,
            gateway: gateway as never,
            tunnel: tunnel as never,
            layer: KnxLayer.LINK_LAYER
        })

        const link = new KnxLink('192.168.0.8')
        link.on('error', () => {})
        await link.connect()

        expect(warn).not.toHaveBeenCalled()

        warn.mockRestore()
    })

    it('connect() creates link with default options', async () => {
        const sendCemiFrame = jest.fn().mockResolvedValue(undefined)
        const gateway = new EventEmitter()
        const tunnel = new EventEmitter()

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockResolvedValue({
            sendCemiFrame,
            individualAddress: '1.1.1',
            ip: '192.168.0.8',
            port: 3671,
            connectionType: KnxConnectionType.TUNNEL_CONNECTION,
            channel: 1,
            gateway: gateway as never,
            tunnel: tunnel as never,
            layer: KnxLayer.LINK_LAYER
        })

        const link = new KnxLink('192.168.0.8')
        link.on('error', () => {})
        await link.connect()

        expect(link.getLinkInfo()).toEqual({
            connectionType: KnxConnectionType.TUNNEL_CONNECTION,
            individualAddress: '1.1.1',
            channel: 1,
            layer: KnxLayer.LINK_LAYER,
            port: 3671,
            ip: '192.168.0.8'
        })
    })

    it('connecting listener registered before connect() is invoked', async () => {
        const connecting = jest.fn()
        const gateway = new EventEmitter()
        const tunnel = new EventEmitter()

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockResolvedValue({
            sendCemiFrame: jest.fn(),
            individualAddress: '1.1.1',
            ip: '192.168.0.8',
            port: 3671,
            connectionType: KnxConnectionType.TUNNEL_CONNECTION,
            channel: 1,
            gateway: gateway as never,
            tunnel: tunnel as never,
            layer: KnxLayer.LINK_LAYER
        })

        const link = new KnxLink('192.168.0.8')
        link.on('error', () => {})
        link.on('connecting', connecting)
        await link.connect()

        expect(connecting).toHaveBeenCalledWith({ ip: '192.168.0.8', port: 3671 })
    })

    it('connect() delivers cemi-frame and error events to on() listeners', async () => {
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
                individualAddress: '1.1.1',
                ip: '192.168.0.8',
                port: 3671,
                connectionType: KnxConnectionType.TUNNEL_CONNECTION,
                channel: 1,
                gateway: gateway as never,
                tunnel: tunnel as never,
                layer: KnxLayer.LINK_LAYER
            }
        })

        const link = new KnxLink('192.168.0.8')
        link.on('error', onError)
        link.on('cemi-frame', onCemiFrame)
        await link.connect()

        expect(onCemiFrame).toHaveBeenCalledWith(cemiFrame)

        const error = { code: 'NETWORK_ERROR' } as never
        link.emit('error', error)

        expect(onError).toHaveBeenCalledWith(error)
    })

    describe('getDatapoint without network', () => {
        beforeEach(() => {
            jest.spyOn(KnxConnection.prototype, 'connect').mockResolvedValue(undefined)
        })

        afterEach(() => {
            jest.restoreAllMocks()
        })

        it('getDatapoint() returns configured DPT instance', () => {
            const link = new KnxLink('192.168.0.8')

            const dp = link.getDatapoint({ address: '2/0/4', DataType: DPT_Switch })

            expect(dp.getAddress()).toBe('2/0/4')
            expect(dp.getLink()).toBe(link)
            expect(dp.toString()).toBe('2/0/4 (1.001)')
        })

        it('getDatapoint() runs optional init callback', () => {
            const link = new KnxLink('192.168.0.8')

            const init = jest.fn()
            link.getDatapoint({ address: '2/0/4', DataType: DPT_Switch }, init)

            expect(init).toHaveBeenCalledTimes(1)
        })

        it('forwards on/off/once/emit to internal event bus', () => {
            const link = new KnxLink('192.168.0.8')
            const listener = jest.fn()

            link.on('error', () => {})
            link.on('error', listener)

            const error = { code: 'NETWORK_ERROR' } as never
            link.emit('error', error)

            expect(listener).toHaveBeenCalledWith(error)

            link.off('error', listener)
            link.emit('error', error)

            expect(listener).toHaveBeenCalledTimes(1)
        })
    })
})
