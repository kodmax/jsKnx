import { IKnxGateway, KnxEventType, KnxMessageCallback } from "../types";
import { KnxErrorCode, KnxConnectionType, KnxServiceId, KnxLayer, KnxIpProtocol } from "../enums";
import { Knx } from "../knx";

import { createSocket, Socket } from "dgram";
import { AddressInfo } from "net";
import * as fs from "fs"

export class IPGateway implements IKnxGateway {
    public constructor(private readonly gateway: Socket, private readonly bus: Socket) {
        gateway.on('message', (msg, rinfo) => {
            const serviceId = KnxServiceId[msg.readUInt16BE(2)]
            const body = msg.slice(6)

            console.log('gateway message', serviceId, body)
            switch (msg.readUInt16BE(2)) {
                case KnxServiceId.CONNECTION_RESPONSE:
                    const channel = msg.readUint8(6)
                    const error = msg.readUint8(7)

                    console.log('CONNECTION RESPONSE', channel, KnxErrorCode[error])
                    break
            }
        })

        bus.on('message', msg => {
            const serviceId = KnxServiceId[msg.readUInt16BE(2)]
            const body = msg.slice(6)

            console.log('bus message', serviceId, body)
        })
    }

    public static async connect(path: string, ip?: string, port?: number): Promise<Knx> {
        const schema = JSON.parse(await fs.promises.readFile(path, { encoding: 'utf-8' }))

        const targetPort: number = port || schema.port || 3671
        const targetIp: string = ip || schema.ip || ''
        if (targetIp) {
            return new Promise((resolve, reject) => {
                const connection: Socket = createSocket('udp4')            
                connection.connect(targetPort, targetIp, () => {
                    const tunnel = createSocket('udp4')
                    tunnel.bind(0, connection.address().address, () => {
                        new IPGateway(connection, tunnel).connect().then(gateway => {
                            resolve(new Knx(gateway, schema))
                        })    
                    })
                })    
            })
    
        } else {
            throw new Error("No IP speciefied for the schema")
        }
    }

    private async connect(): Promise<IPGateway> {
        this.send(this.message(KnxServiceId.CONNECTION_REQUEST, [this.hpai(this.gateway.address()), this.hpai(this.bus.address()), this.cri(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)]), this.gateway)
        
        return this
    }

    private cri(type: KnxConnectionType, layer: KnxLayer): Buffer {
        return Buffer.from([0x04, type, layer, 0x00])
    }

    private hpai (local: AddressInfo): Buffer {
        const hapai = Buffer.from([0x08, KnxIpProtocol.IPV4_UDP, ...local.address.split(/\./g).map(oct => +oct), (local.port & 0xff00) >> 8, local.port & 0xff])
        return hapai
    }

    public message(serviceId: KnxServiceId, blocks: Buffer[]): Buffer {
        const message = Buffer.concat([Buffer.from([0x06, 0x10, (serviceId & 0xff00) >> 8, serviceId & 0xff, 0, 6]), ...blocks])
        message.writeUInt16BE(message.length, 4)
        console.log('message', message)
        return message
    }

    public async send(message: Buffer, socket: Socket) {                
        return new Promise((resolve, reject) => {
            socket.send(message, (error, bytes) => error ? reject(error) : resolve(bytes))
        })

    }

    public removeEventListener(eventType: KnxEventType, cb: KnxMessageCallback): void {

    }

    public addEventListener(eventType: KnxEventType, cb: KnxMessageCallback): void {

    }
}