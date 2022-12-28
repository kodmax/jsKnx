import { Socket } from 'dgram'
import { EventEmitter } from 'stream'
import { KnxCemiCode, KnxErrorCode, KnxServiceId } from '../enums'
import { KnxCemiFrame, KnxIpMessage, TunnelingRequest } from '../message'
import { KnxLinkException, KnxLinkExceptionCode } from '../types'
import { KnxLinkInfo } from './connect'

const establishLogicalConnection = async (
    gateway: Socket,
    tunnel: Socket,
    events: EventEmitter,
    connectionTimeout: number
): Promise<Omit<KnxLinkInfo, 'connectionType' | 'layer'>> => {
    return new Promise((resolve, reject) => {
        const cb = (msg: Buffer) => {
            gateway.off('message', cb)

            if (msg.readUInt16BE(2) === KnxServiceId.CONNECTION_RESPONSE) {
                const knxErrorCode = msg.readUint8(7)
                if (knxErrorCode !== 0) {
                    const error = (KnxErrorCode[knxErrorCode] ?? KnxErrorCode[KnxErrorCode.UNKNOWN_ERROR]) as keyof typeof KnxErrorCode
                    reject(new KnxLinkException('Error Connectiong to KNX/IP Gateway: ' + error, KnxLinkExceptionCode.E_CONNECTION_ERROR, {
                        knxErrorCode
                    }))

                } else {

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

                    tunnel.on('message', msg => {
                        const ipMessage = KnxIpMessage.decode(msg)
                        if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST) {
                            const tunneling = new TunnelingRequest(ipMessage.getBody())
                            tunnel.send(tunneling.ack().getBuffer())

                            if ([KnxCemiCode.L_Data_Indication].includes(tunneling.getCemiCode())) {
                                const cemiFrame = new KnxCemiFrame(tunneling.getBody())
                                events.emit('cemi-frame', cemiFrame)
                            }
                        }
                    })

                    const address = msg.readUint16BE(18)
                    resolve({
                        gatewayAddress: [address >> 12, (address >> 8) & 0xf, address & 0xff].join('.'),
                        ip: Uint8Array.from(msg.slice(10, 14)).join('.'),
                        port: msg.readUint16BE(14),
                        channel: msg.readUint8(6),
                        gateway,
                        tunnel
                    })
                }

            } else {
                reject(new Error('No Connection Response.'))
            }
        }

        setTimeout(() => { reject(new Error('Knx IP Gateway connection timeout')) }, connectionTimeout)
        gateway.on('message', cb)
    })
}

export { establishLogicalConnection }
