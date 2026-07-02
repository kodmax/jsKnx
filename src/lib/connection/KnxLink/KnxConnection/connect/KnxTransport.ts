import { Socket } from 'dgram'
import { connectSockets } from './connect-sockets'

export class KnxTransport {
    private constructor(
        private readonly gateway: Socket,
        private readonly tunnel: Socket
    ) {}

    static async open(ip: string, port: number): Promise<KnxTransport> {
        const [gateway, tunnel] = await connectSockets(ip, port)

        return new KnxTransport(gateway, tunnel)
    }

    getGateway(): Socket {
        return this.gateway
    }

    getTunnel(): Socket {
        return this.tunnel
    }

    onClose(cb: () => void): void {
        this.gateway.once('close', () => {
            cb()
        })

        this.tunnel.once('close', () => {
            cb()
        })
    }

    close(): void {
        try {
            this.gateway.close()
        } catch {
            // ignore
        }

        try {
            this.tunnel.close()
        } catch {
            // ignore
        }
    }
}
