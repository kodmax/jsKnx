import { KnxErrorCode, KnxConnectionType, KnxServiceId, KnxLayer } from "../enums"
import { KnxIpMessage, hpai, cri } from "../message"

import { createSocket, RemoteInfo, Socket } from "dgram"
import { KnxLinkException, KnxLinkExceptionCode } from "../types"

export type KnxLinkInfo = {
    connectionType: KnxConnectionType
    gatewayAddress: string
    channel: number
    layer: KnxLayer
    port: number
    ip: string
}

/**
 * Docs
 * http://www.eb-systeme.de/?page_id=479
 */
export class KnxConnection {
    public static async bind(ip: string, port: number): Promise<KnxConnection> {
        const gateway: Socket = createSocket("udp4")
        const tunnel: Socket = createSocket("udp4")

        return new Promise(resolve => {
            gateway.connect(port, ip, () => {
                tunnel.connect(port, ip, () => {
                    resolve(new KnxConnection(gateway, tunnel))
                })
            })
        })
    }

    private constructor(private readonly gateway: Socket, private readonly tunnel: Socket) {
        gateway.on("error", err => {
            throw err
        })

        tunnel.on("error", err => {
            throw err
        })
    }

    public getGateway(): Socket {
        return this.gateway
    }

    public getTunnel(): Socket {
        return this.tunnel
    }

    public close(): void {
        this.gateway.close()
        this.tunnel.close()
    }

    public async disconnect(channel: number): Promise<void> {
        await KnxIpMessage.compose(KnxServiceId.DISCONNECT_REQUEST, [Buffer.from([channel, 0x00]), hpai(this.gateway.address())]).send(this.gateway)
    }

    public async connect(connectionType: KnxConnectionType, layer: KnxLayer): Promise<KnxLinkInfo> {        
        let linkInfo: KnxLinkInfo
        return new Promise((resolve, reject) => {
            const cb = (msg: Buffer, rinfo: RemoteInfo) => {
                if (msg.readUInt16BE(2) === KnxServiceId.CONNECTION_RESPONSE) {
                    const error: number = msg.readUint8(7)                
                    if (error) {
                        this.gateway.off("message", cb)

                        reject(new KnxLinkException("Error Connectiong to KNX/IP Gateway: " + KnxErrorCode[error], KnxLinkExceptionCode.E_CONNECTION_ERROR, {
                            knxErrorCode: KnxErrorCode [KnxErrorCode[error]]
                        }))
    
                    } else {
                        const address = msg.readUint16BE(18)
                        linkInfo = {
                            gatewayAddress: [address >> 12, (address >> 8) & 0xf, address & 0xff].join("."),
                            ip: Uint8Array.from(msg.slice(10, 14)).join("."),
                            port: msg.readUint16BE(14),
                            channel: msg.readUint8(6),
                            connectionType,
                            layer,
                        }

                        KnxIpMessage.compose(KnxServiceId.CONNECTIONSTATE_REQUEST, [Buffer.from([linkInfo.channel, 0x00]), hpai(this.gateway.address())]).send(this.tunnel)
                    }

                } else if (msg.readUint16BE(2) === KnxServiceId.CONNECTIONSTATE_RESPONSE) {
                    this.gateway.off("message", cb)

                    const error: number = msg.readUint8(7)
                    if (error) {
                        reject(new KnxLinkException("Error Connectiong to KNX/IP Gateway: " + KnxErrorCode[error], KnxLinkExceptionCode.E_CONNECTION_ERROR, {
                            knxErrorCode: KnxErrorCode [KnxErrorCode[error]]
                        }))
    
                    } else {
                        resolve(linkInfo)
                    }
                }
            }
    
            KnxIpMessage.compose(KnxServiceId.CONNECTION_REQUEST, [hpai(this.gateway.address()), hpai(this.tunnel.address()), cri(connectionType, layer)]).send(this.gateway)
            this.gateway.on("message", cb)
        })
    }
}
