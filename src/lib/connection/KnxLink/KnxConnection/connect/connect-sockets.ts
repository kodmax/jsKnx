import { createSocket, Socket } from 'dgram'
import { knxNetworkError } from '../../../../types'

const connectSockets = async (ip: string, port: number): Promise<[gateway: Socket, tunnel: Socket]> => {
    const gateway: Socket = createSocket('udp4')
    const tunnel: Socket = createSocket('udp4')

    await new Promise((resolve, reject) => {
        gateway.connect(port, ip)

        gateway.on('connect', () => {
            tunnel.connect(port, ip)

            tunnel.on('connect', () => {
                resolve(void 0)
            })

            tunnel.on('error', err => {
                try {
                    gateway.close()
                } catch {
                    // ignore
                }
                reject(knxNetworkError(err))
            })
        })

        gateway.on('error', err => {
            reject(knxNetworkError(err))
        })
    })

    return [gateway, tunnel]
}

export { connectSockets }
