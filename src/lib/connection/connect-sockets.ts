import { createSocket, Socket } from 'dgram'
import { KnxServiceId } from '../enums'
import { KnxIpMessage } from '../message'

const connectSockets = async (ip: string, port: number): Promise<[gateway: Socket, tunnel: Socket]> => {
    const gateway: Socket = createSocket('udp4')
    const tunnel: Socket = createSocket('udp4')

    await new Promise((resolve, reject) => {
        gateway.connect(port, ip)
        gateway.on('error', err => {
            reject(err)
        })

        gateway.on('connect', () => {
            tunnel.connect(port, ip)
            tunnel.on('error', err => {
                reject(err)
            })

            tunnel.on('connect', () => {
                resolve(void 0)
            })
        })
    })

    gateway.on('message', data => {
        const ipMessage = KnxIpMessage.decode(data)
        if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_REQUEST) {
            gateway.close()
            tunnel.close()

        } else if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_RESPONSE) {
            gateway.close()
            tunnel.close()
        }
    })

    return [gateway, tunnel]
}

export { connectSockets }
