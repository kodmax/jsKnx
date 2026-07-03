import EventEmitter from 'events'
import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'
import { KnxLinkException } from '@repo/knx-common'
import connect from './connect'
import { tunnelRequest } from './tunnel-request'

jest.mock('./tunnel-request')

const tunnelRequestMock = tunnelRequest as jest.MockedFunction<typeof tunnelRequest>

function connectionResponseBuffer(): Buffer {
    const buf = Buffer.alloc(22)

    buf.writeUInt16BE(0x0610, 0)
    buf.writeUInt16BE(0x0206, 2)
    buf.writeUInt16BE(buf.length, 4)
    buf.writeUint8(5, 6)
    buf.writeUint8(0, 7)
    buf.writeUint8(192, 10)
    buf.writeUint8(168, 11)
    buf.writeUint8(0, 12)
    buf.writeUint8(8, 13)
    buf.writeUInt16BE(3671, 14)
    buf.writeUInt16BE((1 << 12) + (2 << 8) + 3, 18)

    return buf
}

describe('connect', () => {
    const options = {
        maxConcurrentMessages: 16,
        maxTelegramsPerSecond: 24,
        readTimeout: 10000,
        port: 3671,
        maxRetry: 0,
        retryPause: 1000,
        connectionTimeout: 10000
    }

    beforeEach(() => {
        tunnelRequestMock.mockReset()
    })

    it('returns link info from gateway connection response', async () => {
        const gateway = new EventEmitter()
        const tunnel = new EventEmitter()

        tunnelRequestMock.mockResolvedValue(connectionResponseBuffer())
        Object.assign(tunnel, {
            address: () => ({ address: '192.168.0.9', port: 3672, family: 'IPv4' })
        })

        const linkInfo = await connect(options, gateway as never, tunnel as never, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)

        expect(linkInfo.channel).toBe(5)
        expect(linkInfo.individualAddress).toBe('1.2.3')
        expect(linkInfo.ip).toBe('192.168.0.8')
        expect(linkInfo.port).toBe(3671)
        expect(linkInfo.gateway).toBe(gateway)
        expect(linkInfo.tunnel).toBe(tunnel)
        expect(linkInfo.connectionType).toBe(KnxConnectionType.TUNNEL_CONNECTION)
        expect(linkInfo.layer).toBe(KnxLayer.LINK_LAYER)
    })

    it('rethrows when tunnelRequest fails', async () => {
        const gateway = new EventEmitter()
        const tunnel = new EventEmitter()

        tunnelRequestMock.mockRejectedValue(new KnxLinkException('CONNECTION_TIMEOUT', 'timeout', {}))
        Object.assign(tunnel, {
            address: () => ({ address: '192.168.0.9', port: 3672, family: 'IPv4' })
        })

        await expect(connect(options, gateway as never, tunnel as never, KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)).rejects.toMatchObject({
            code: 'CONNECTION_TIMEOUT'
        })
    })
})
