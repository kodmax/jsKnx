import { KnxConnectionType, KnxErrorCode, KnxLayer, KnxServiceId } from '../../enums'
import { KnxLinkException, KnxLinkExceptionCode } from '../../types'
import { cri, hpai, KnxIpMessage } from '../../message'
import { AddressInfo } from 'net'
import { Socket } from 'dgram'

type TunnelRequest = (
    gateway: Socket,
    tunnelAddress: AddressInfo,
    connectionTimeout: number,
    connectionType: KnxConnectionType,
    layer: KnxLayer
) => Promise<Buffer>

const tunnelRequest: TunnelRequest = async (gateway, tunnelAddress, connectionTimeout, connectionType, layer) => {
    await new Promise((resolve, reject) => {
        const connRequest = KnxIpMessage.compose(
            KnxServiceId.CONNECTION_REQUEST,
            [
                hpai(gateway.address()),
                hpai(tunnelAddress),
                cri(connectionType, layer)
            ]
        )

        gateway.send(connRequest.getBuffer(), error => error ? reject(error) : resolve(void 0))
    })

    return new Promise((resolve, reject) => {
        gateway.once('message', (msg: Buffer) => {

            const serviceId = msg.readUInt16BE(2)
            if (serviceId === KnxServiceId.CONNECTION_RESPONSE) {
                const knxErrorCode = msg.readUint8(7)

                if (knxErrorCode === 0) {
                    resolve(msg)

                } else {
                    const error = (KnxErrorCode[knxErrorCode] ?? KnxErrorCode[KnxErrorCode.UNKNOWN_ERROR]) as keyof typeof KnxErrorCode
                    reject(new KnxLinkException(
                        'Error Connectiong to KNX/IP Gateway: ' + error,
                        KnxLinkExceptionCode.E_CONNECTION_ERROR,
                        { knxErrorCode }
                    ))
                }

            } else {
                reject(new KnxLinkException(
                    'Error Connectiong to KNX/IP Gateway',
                    KnxLinkExceptionCode.E_NOT_A_CONNECTION_RESPONSE,
                    { serviceId }
                ))
            }
        })

        setTimeout(() => {
            reject(new KnxLinkException(
                'Knx IP Gateway connection timeout',
                KnxLinkExceptionCode.E_CONNECTION_TIMEOUT,
                {}
            ))
        }, connectionTimeout)
    })
}

export { tunnelRequest }
