import { KnxConnectionType, KnxLayer } from '../../enums'
import { InternalLinkInfo, LinkInfo } from '../link/LinkInfo'
import { messageHandler } from './message-handler'
import { tunnelRequest } from './tunnel-request'
import { KnxLinkOptions } from '../link/LinkOptions'
import { KnxLinkException } from '../../types'
import { Socket } from 'dgram'

type Connect = (options: KnxLinkOptions, gateway: Socket, tunnel: Socket, connectionType: KnxConnectionType, layer: KnxLayer) => Promise<InternalLinkInfo>

const connect: Connect = async (options, gateway, tunnel, connectionType, layer): Promise<InternalLinkInfo> => {
    try {
        const connectionInfo: Buffer = await tunnelRequest(
            gateway,
            tunnel.address(),
            options.connectionTimeout,
            connectionType,
            layer
        )

        const address = connectionInfo.readUint16BE(18)
        const channel = connectionInfo.readUint8(6)

        return {
            sendCemiFrame: messageHandler(tunnel, channel, options.maxConcurrentMessages, options.maxTelegramsPerSecond, cemiFrame => {
                options.events.emit('cemi-frame', cemiFrame)
            }),

            gatewayAddress: [address >> 12, (address >> 8) & 0xf, address & 0xff].join('.'),
            ip: Uint8Array.from(connectionInfo.slice(10, 14)).join('.'),
            port: connectionInfo.readUint16BE(14),

            connectionType,
            gateway,
            channel,
            tunnel,
            layer
        }

    } catch (e) {
        options.events.emit('error', e as KnxLinkException)
        throw e
    }
}

export type { KnxLinkOptions, InternalLinkInfo, LinkInfo }
export default connect
