import { createSocket, RemoteInfo, Socket } from "dgram"
import EventEmitter from "events"
import { KnxCemiCode, KnxConnectionType, KnxErrorCode, KnxLayer, KnxServiceId } from "../enums"
import { cri, hpai, KnxCemiFrame, KnxIpMessage, TunnelingRequest } from "../message"
import { KnxLinkException, KnxLinkExceptionCode, KnxLinkOptions } from "../types"

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

const connect: (options: KnxLinkOptions, ip: string, connectionType: KnxConnectionType, layer: KnxLayer) => Promise<KnxLinkInfo> = async (options, ip, connectionType, layer) => {
    const gateway: Socket = createSocket("udp4")
    const tunnel: Socket = createSocket("udp4")

    await new Promise((resolve, reject) => {
        gateway.connect(options.port, ip)
        gateway.on("error", err => {
            reject(err)
        })

        gateway.on("connect", () => {
            tunnel.connect(options.port, ip)
            tunnel.on("error", err => {
                reject(err)
            })

            tunnel.on("connect", () => {
                resolve(void 0)
            })
        })
    })

    const connRequest = KnxIpMessage.compose(KnxServiceId.CONNECTION_REQUEST, [hpai(gateway.address()), hpai(tunnel.address()), cri(connectionType, layer)])
    await new Promise((resolve, reject) => {
        gateway.send(connRequest.getBuffer(), error => error ? reject(error) : resolve(void 0))
    })

    return await new Promise((resolve, reject) => {
        const cb = (msg: Buffer, rinfo: RemoteInfo) => {
            gateway.off("message", cb)

            if (msg.readUInt16BE(2) === KnxServiceId.CONNECTION_RESPONSE) {
                const error: number = msg.readUint8(7)                
                if (error) {
                    reject(new KnxLinkException("Error Connectiong to KNX/IP Gateway: " + KnxErrorCode[error], KnxLinkExceptionCode.E_CONNECTION_ERROR, {
                        knxErrorCode: KnxErrorCode [KnxErrorCode[error]]
                    }))
        
                } else {

                    gateway.on("message", data => {
                        const ipMessage = KnxIpMessage.decode(data)
                        if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_REQUEST) {
                            gateway.close()
                            tunnel.close()
                    
                        } else if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_RESPONSE) {
                            gateway.close()
                            tunnel.close()
                        }
                    })

                    tunnel.on("message", msg => {
                        const ipMessage = KnxIpMessage.decode(msg)
                        if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST) {
                            const tunneling = new TunnelingRequest(ipMessage.getBody())
                            tunnel.send(tunneling.ack().getBuffer())
            
                            if ([KnxCemiCode.L_Data_Indication].includes(tunneling.getCemiCode())) {
                                const cemiFrame = new KnxCemiFrame(tunneling.getBody())
                                options.events.emit("cemi-frame", cemiFrame)
                            }
                        }
                    })

                    const address = msg.readUint16BE(18)
                    resolve({
                        gatewayAddress: [address >> 12, (address >> 8) & 0xf, address & 0xff].join("."),
                        ip: Uint8Array.from(msg.slice(10, 14)).join("."),
                        port: msg.readUint16BE(14),
                        channel: msg.readUint8(6),
                        connectionType,
                        gateway,
                        tunnel,
                        layer,
                    })
                }
        
            } else {
                reject(new Error("No Connection Response."))
            }
        }

        setTimeout(() => { reject(new Error("Knx IP Gateway connection timeout")) }, options.connectionTimeout)
        gateway.on("message", cb)
    })
}

export default connect
