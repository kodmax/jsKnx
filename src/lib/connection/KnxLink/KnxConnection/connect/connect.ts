import { tunnelRequest } from './KnxTunnel/tunnel-request'
import type { Connect } from './types'

const connect: Connect = async (options, gateway, tunnel, connectionType, layer) => {
    const connectionInfo: Buffer = await tunnelRequest(gateway, tunnel.address(), options.connectionTimeout, connectionType, layer)

    const address = connectionInfo.readUInt16BE(18)
    const channel = connectionInfo.readUint8(6)

    return {
        individualAddress: [address >> 12, (address >> 8) & 0xf, address & 0xff].join('.'),
        ip: Uint8Array.from(connectionInfo.slice(10, 14)).join('.'),
        port: connectionInfo.readUint16BE(14),

        connectionType,
        gateway,
        channel,
        tunnel,
        layer
    }
}

export default connect
