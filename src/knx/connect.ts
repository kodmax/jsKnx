import { KnxErrorCode, KnxConnectionType, KnxServiceId, KnxLayer } from "./enums";
import { Message, hpai, cri } from "./message";
import { Knx } from "./knx";

import { createSocket, RemoteInfo, Socket } from "dgram";
import * as fs from "fs"


export async function connect(path: string, ip?: string, port?: number): Promise<Knx> {
    const schema = JSON.parse(await fs.promises.readFile(path, { encoding: 'utf-8' }))
    const targetPort: number = port || schema.port || 3671
    const targetIp: string = ip || schema.ip || ''
    
    if (targetIp) {
        return new Promise((resolve, reject) => {
            const gateway: Socket = createSocket('udp4')            
            gateway.connect(targetPort, targetIp, () => {
                const bus = createSocket('udp4')
                bus.bind(0, gateway.address().address, () => {
                    Message.compose(KnxServiceId.CONNECTION_REQUEST, [hpai(gateway), hpai(bus), cri(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)]).send(gateway)
                    const cb = (msg: Buffer, rinfo: RemoteInfo) => {
                        if (msg.readUInt16BE(2) === KnxServiceId.CONNECTION_RESPONSE) {
                            const channel: number = msg.readUint8(6)
                            const error: number = msg.readUint8(7)
                            gateway.off('message', cb)

                            if (error) {
                                reject(new Error('Error Connection to KNX/IP Gateway: ' + KnxErrorCode[error]))

                            } else {
                                resolve(new Knx(schema, channel, bus, gateway))
                            }
                        }
                    }

                    gateway.on('message', cb)
                })
            })    
        })

    } else {
        throw new Error("No IP speciefied for the schema")
    }
}
