import EventEmitter from 'events'
import { KnxConnectionType, KnxLayer, KnxCemiCode, KnxServiceId } from '@repo/knx-enums'
import { KnxConnection } from './KnxConnection'
import { KnxLink } from './KnxLink'
import { DPT_Switch } from '@repo/knx-dpts'
import { KnxCemiFrame } from '@repo/knx-message'
import { KnxIpMessage } from './KnxConnection/connect/KnxTunnel/message/ip-message'
import { TunnelingFrame } from './KnxConnection/connect/KnxTunnel/message/TunnelingFrame'
import { InternalLinkInfo } from './types'

jest.mock('./KnxConnection/connect/connect-sockets')
jest.mock('./KnxConnection/connect/connect')

import { connectSockets } from './KnxConnection/connect/connect-sockets'
import connect from './KnxConnection/connect/connect'

const connectSocketsMock = connectSockets as jest.MockedFunction<typeof connectSockets>
const connectMock = connect as jest.MockedFunction<typeof connect>

const activeTunnels: EventEmitter[] = []
const activeLinks: KnxLink[] = []

function trackTunnel(tunnel: EventEmitter): EventEmitter {
    activeTunnels.push(tunnel)

    return tunnel
}

function trackConnectedLink(link: KnxLink): KnxLink {
    activeLinks.push(link)

    return link
}

function createTestLink(ip = '192.168.0.8'): KnxLink {
    return new KnxLink(ip, { maxRetry: 0 })
}

function mockLinkInfo(gateway: EventEmitter, tunnel: EventEmitter): InternalLinkInfo {
    return {
        individualAddress: '1.1.1',
        ip: '192.168.0.8',
        port: 3671,
        connectionType: KnxConnectionType.TUNNEL_CONNECTION,
        channel: 1,
        gateway: gateway as never,
        tunnel: tunnel as never,
        layer: KnxLayer.LINK_LAYER
    }
}

describe('KnxLink', () => {
    beforeEach(() => {
        connectSocketsMock.mockReset()
        connectMock.mockReset()
        activeTunnels.length = 0
    })

    afterEach(() => {
        for (const link of activeLinks) {
            ;(link as unknown as { connection: { explicitDisconnect: boolean } }).connection.explicitDisconnect = true
        }

        for (const tunnel of activeTunnels) {
            tunnel.emit('close')
        }

        activeLinks.length = 0
        activeTunnels.length = 0
    })

    it('connect() warns when no error listener is registered', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const gateway = new EventEmitter()
        const tunnel = trackTunnel(new EventEmitter())

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockResolvedValue(mockLinkInfo(gateway, tunnel))

        const link = trackConnectedLink(createTestLink())
        await link.connect()

        expect(warn).toHaveBeenCalledWith(
            'js-knx: KnxLink has no error listener. Call knx.on("error", …) before connect(), or unhandled errors will crash the process.'
        )

        warn.mockRestore()
    })

    it('connect() does not warn when error listener is registered before connect()', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const gateway = new EventEmitter()
        const tunnel = trackTunnel(new EventEmitter())

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockResolvedValue(mockLinkInfo(gateway, tunnel))

        const link = trackConnectedLink(createTestLink())
        link.on('error', () => {})
        await link.connect()

        expect(warn).not.toHaveBeenCalled()

        warn.mockRestore()
    })

    it('connect() creates link with default options', async () => {
        const gateway = new EventEmitter()
        const tunnel = trackTunnel(new EventEmitter())

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockResolvedValue(mockLinkInfo(gateway, tunnel))

        const link = trackConnectedLink(createTestLink())
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
        const tunnel = trackTunnel(new EventEmitter())

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockResolvedValue(mockLinkInfo(gateway, tunnel))

        const link = trackConnectedLink(createTestLink())
        link.on('error', () => {})
        link.on('connecting', connecting)
        await link.connect()

        expect(connecting).toHaveBeenCalledWith({ ip: '192.168.0.8', port: 3671 })
    })

    it('connect() delivers cemi-frame and error events to on() listeners', async () => {
        const onError = jest.fn()
        const onCemiFrame = jest.fn()
        const gateway = new EventEmitter()
        const tunnel = trackTunnel(Object.assign(new EventEmitter(), { send: jest.fn() }))
        const cemiBuffer = KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '1/2/3', Buffer.from([0x00, 0x01]))
        const cemiFrame = KnxCemiFrame.decode(cemiBuffer)

        connectSocketsMock.mockResolvedValue([gateway, tunnel] as never)
        connectMock.mockResolvedValue(mockLinkInfo(gateway, tunnel))

        const link = trackConnectedLink(createTestLink())
        link.on('error', onError)
        link.on('cemi-frame', onCemiFrame)
        await link.connect()

        const packet = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingFrame.compose(1, 9), cemiBuffer]).getBuffer()
        tunnel.emit('message', packet)

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
