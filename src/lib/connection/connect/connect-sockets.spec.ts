import EventEmitter from 'events'
import { createSocket, Socket } from 'dgram'
import { connectSockets } from './connect-sockets'
import { KnxLinkException } from '../../types'

jest.mock('dgram')

const createSocketMock = createSocket as jest.MockedFunction<typeof createSocket>

type MockSocket = EventEmitter & {
    connect: jest.Mock
}

function createMockSocket(): MockSocket {
    const socket = new EventEmitter() as MockSocket

    socket.connect = jest.fn()

    return socket
}

describe('connectSockets', () => {
    beforeEach(() => {
        createSocketMock.mockReset()
    })

    it('connects gateway and tunnel and returns both sockets', async () => {
        const gateway = createMockSocket()
        const tunnel = createMockSocket()

        createSocketMock.mockReturnValueOnce(gateway as unknown as Socket).mockReturnValueOnce(tunnel as unknown as Socket)

        const promise = connectSockets('192.168.0.8', 3671)

        gateway.emit('connect')
        tunnel.emit('connect')

        await expect(promise).resolves.toEqual([gateway, tunnel])
        expect(createSocketMock).toHaveBeenCalledTimes(2)
        expect(createSocketMock).toHaveBeenNthCalledWith(1, 'udp4')
        expect(createSocketMock).toHaveBeenNthCalledWith(2, 'udp4')
        expect(gateway.connect).toHaveBeenCalledWith(3671, '192.168.0.8')
        expect(tunnel.connect).toHaveBeenCalledWith(3671, '192.168.0.8')
    })

    it('rejects with NETWORK_ERROR when gateway connect fails', async () => {
        const gateway = createMockSocket()
        const tunnel = createMockSocket()

        createSocketMock.mockReturnValueOnce(gateway as unknown as Socket).mockReturnValueOnce(tunnel as unknown as Socket)

        const promise = connectSockets('10.0.0.1', 3671)

        gateway.emit('error', new Error('EHOSTUNREACH'))

        await expect(promise).rejects.toMatchObject({
            code: 'NETWORK_ERROR',
            message: expect.stringContaining('EHOSTUNREACH')
        })
        expect(tunnel.connect).not.toHaveBeenCalled()
    })

    it('rejects with NETWORK_ERROR when tunnel connect fails', async () => {
        const gateway = createMockSocket()
        const tunnel = createMockSocket()

        createSocketMock.mockReturnValueOnce(gateway as unknown as Socket).mockReturnValueOnce(tunnel as unknown as Socket)

        const promise = connectSockets('10.0.0.1', 3671)

        gateway.emit('connect')
        tunnel.emit('error', new Error('tunnel failed'))

        await expect(promise).rejects.toMatchObject({
            code: 'NETWORK_ERROR',
            message: expect.stringContaining('tunnel failed')
        })
    })

    it('wraps gateway errors as KnxLinkException', async () => {
        const gateway = createMockSocket()
        const tunnel = createMockSocket()

        createSocketMock.mockReturnValueOnce(gateway as unknown as Socket).mockReturnValueOnce(tunnel as unknown as Socket)

        const promise = connectSockets('192.168.0.8', 3671)
        gateway.emit('error', new Error('socket error'))

        try {
            await promise
        } catch (e) {
            expect(e).toBeInstanceOf(KnxLinkException)
            expect((e as KnxLinkException).code).toBe('NETWORK_ERROR')
        }
    })
})
