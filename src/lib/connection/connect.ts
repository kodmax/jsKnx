import { createSocket, Socket } from 'dgram'
import { KnxConnectionType, KnxLayer, KnxServiceId } from '../enums'
import { cri, hpai, KnxIpMessage } from '../message'
import { KnxLinkOptions } from '../types'
import { establishLogicalConnection } from './logical-connection'

export type KnxLinkInfo = {
    connectionType: KnxConnectionType
    gatewayAddress: string
    channel: number
    layer: KnxLayer

    gateway: Socket
    tunnel: Socket
    port: number
    ip: string
}

type Connect = (options: KnxLinkOptions, ip: string, connectionType: KnxConnectionType, layer: KnxLayer) => Promise<KnxLinkInfo>
const connect: Connect = async (options, ip, connectionType, layer): Promise<KnxLinkInfo> => {
    const gateway: Socket = createSocket('udp4')
    const tunnel: Socket = createSocket('udp4')

    await new Promise((resolve, reject) => {
        gateway.connect(options.port, ip)
        gateway.on('error', err => {
            reject(err)
        })

        gateway.on('connect', () => {
            tunnel.connect(options.port, ip)
            tunnel.on('error', err => {
                reject(err)
            })

            tunnel.on('connect', () => {
                resolve(void 0)
            })
        })
    })

    const connRequest = KnxIpMessage.compose(
        KnxServiceId.CONNECTION_REQUEST,
        [
            hpai(gateway.address()),
            hpai(tunnel.address()),
            cri(connectionType, layer)
        ]
    )

    await new Promise((resolve, reject) => {
        gateway.send(connRequest.getBuffer(), error => error ? reject(error) : resolve(void 0))
    })

    return {
        ...await establishLogicalConnection(gateway, tunnel, options.events, options.connectionTimeout),
        connectionType,
        layer
    }
}

export default connect
