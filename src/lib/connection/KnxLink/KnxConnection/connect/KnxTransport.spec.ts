import EventEmitter from 'events'
import { Socket } from 'dgram'
import { KnxTransport } from './KnxTransport'
import { connectSockets } from './connect-sockets'

jest.mock('./connect-sockets')

const connectSocketsMock = connectSockets as jest.MockedFunction<typeof connectSockets>

type MockSocket = EventEmitter & {
    close: jest.Mock
}

function createMockSocket(): MockSocket {
    const socket = new EventEmitter() as MockSocket

    socket.close = jest.fn(() => {
        socket.emit('close')
        return socket as unknown as Socket
    })

    return socket
}

describe('KnxTransport', () => {
    beforeEach(() => {
        connectSocketsMock.mockReset()
    })

    it('opens connected gateway and tunnel sockets', async () => {
        const gateway = createMockSocket()
        const tunnel = createMockSocket()

        connectSocketsMock.mockResolvedValue([gateway as unknown as Socket, tunnel as unknown as Socket])

        const transport = await KnxTransport.open('192.168.0.8', 3671)

        expect(connectSocketsMock).toHaveBeenCalledWith('192.168.0.8', 3671)
        expect(transport.getGateway()).toBe(gateway)
        expect(transport.getTunnel()).toBe(tunnel)
    })

    it('closes gateway and tunnel sockets', async () => {
        const gateway = createMockSocket()
        const tunnel = createMockSocket()

        connectSocketsMock.mockResolvedValue([gateway as unknown as Socket, tunnel as unknown as Socket])

        const transport = await KnxTransport.open('192.168.0.8', 3671)

        transport.close()

        expect(gateway.close).toHaveBeenCalled()
        expect(tunnel.close).toHaveBeenCalled()
    })

    it('fires callback when gateway socket closes', async () => {
        const gateway = createMockSocket()
        const tunnel = createMockSocket()

        connectSocketsMock.mockResolvedValue([gateway as unknown as Socket, tunnel as unknown as Socket])

        const transport = await KnxTransport.open('192.168.0.8', 3671)
        const onClose = jest.fn()

        transport.onClose(onClose)
        gateway.emit('close')

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('fires callback when tunnel socket closes', async () => {
        const gateway = createMockSocket()
        const tunnel = createMockSocket()

        connectSocketsMock.mockResolvedValue([gateway as unknown as Socket, tunnel as unknown as Socket])

        const transport = await KnxTransport.open('192.168.0.8', 3671)
        const onClose = jest.fn()

        transport.onClose(onClose)
        tunnel.emit('close')

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
