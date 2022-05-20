import { KnxErrorCode, KnxConnectionType, KnxServiceId, KnxLayer } from "../enums"
import { KnxIpMessage, hpai, cri } from "../message"

import { createSocket, RemoteInfo, Socket } from "dgram"

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

    private connectionType?: KnxConnectionType
    private channel: number = 0
    private layer?: KnxLayer

    private constructor(private readonly gateway: Socket, private readonly tunnel: Socket) {
        gateway.on("message", data => {
            const msg = KnxIpMessage.decode(data)
            if (msg.getServiceId() === KnxServiceId.DISCONNECT_REQUEST) {
                if (this.connectionType && this.layer) {
                    this.connect(this.connectionType, this.layer)
                }
            }
        })

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

    public getChannel(): number {
        return this.channel
    }

    public close(): void {
        this.gateway.close()
        this.tunnel.close()
    }

    public async disconnect(): Promise<void> {
        this.connectionType = undefined
        this.layer = undefined

        //

        // KnxIpMessage.compose(KnxServiceId.DISCONNECT_REQUEST, [hpai(this.gateway), hpai(this.tunnel), cri(connectionType, layer)]).send(this.gateway)
    }

    public async connect(connectionType: KnxConnectionType, layer: KnxLayer): Promise<number> {
        this.connectionType = connectionType
        this.layer = layer
        
        return new Promise((resolve, reject) => {
            const cb = (msg: Buffer, rinfo: RemoteInfo) => {
                if (msg.readUInt16BE(2) === KnxServiceId.CONNECTION_RESPONSE) {
                    const error: number = msg.readUint8(7)
                    this.channel = msg.readUint8(6)
                    this.gateway.off("message", cb)
    
                    if (error) {
                        reject(new Error("Error Connection to KNX/IP Gateway: " + KnxErrorCode[error]))
    
                    } else {
                        resolve(this.channel)
                    }
                }
            }
    
            KnxIpMessage.compose(KnxServiceId.CONNECTION_REQUEST, [hpai(this.gateway), hpai(this.tunnel), cri(connectionType, layer)]).send(this.gateway)
            this.gateway.on("message", cb)
        })
    }
}
