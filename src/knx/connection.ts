import { KnxErrorCode, KnxConnectionType, KnxServiceId, KnxLayer } from "./enums";
import { KnxMessage, hpai, cri } from "./message";

import { createSocket, RemoteInfo, Socket } from "dgram";

export class KnxConnection {
    public static async bind(ip: string, port: number): Promise<KnxConnection> {
        const gateway: Socket = createSocket('udp4')
        const tunnel: Socket = createSocket('udp4')

        return new Promise((resolve, reject) => {
            gateway.connect(port, ip, () => {
                tunnel.bind(0, gateway.address().address, () => {
                    resolve(new KnxConnection(gateway, tunnel))
                })
            })
        })
    }

    private constructor(private readonly gateway: Socket, private readonly tunnel: Socket) {
        gateway.on('message', msg => {
            KnxMessage.decode(msg).dump("Gateway message")
        })

        gateway.on('error', err => {
            throw err
        })

        tunnel.on('error', err => {
            throw err
        })
    }

    public getGateway(): Socket {
        return this.gateway
    }

    public getTunnel(): Socket {
        return this.tunnel
    }

    public async connect(): Promise<number> {
        return new Promise((resolve, reject) => {
            const cb = (msg: Buffer, rinfo: RemoteInfo) => {
                if (msg.readUInt16BE(2) === KnxServiceId.CONNECTION_RESPONSE) {
                    this.gateway.off('message', cb)
                    const channel: number = msg.readUint8(6)
                    const error: number = msg.readUint8(7)
                    this.gateway.off('message', cb)
    
                    if (error) {
                        reject(new Error('Error Connection to KNX/IP Gateway: ' + KnxErrorCode[error]))
    
                    } else {
                        resolve(channel)
                    }
                }
            }
    
            KnxMessage.compose(KnxServiceId.CONNECTION_REQUEST, [hpai(this.gateway), hpai(this.tunnel), cri(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)]).send(this.gateway)
            this.gateway.on('message', cb)
        })
    }
}
