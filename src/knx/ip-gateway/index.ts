import { KnxServiceDescriptor, KnxServiceType } from "./service-descriptor";
import { IKnxGateway, KnxEventType, KnxMessageCallback } from "../types";
import { Knx } from "../knx";

import { createSocket, Socket } from "dgram";
import * as fs from "fs"
import { AddressInfo } from "net";

export class IPGateway implements IKnxGateway {
    public constructor(private readonly bus: Socket, private readonly tunnel: Socket) {
        // console.log('Gateway initialization')
        // this.bus.on('error', err => {
        //     console.log('bus error', err)
        // })
        
        // this.bus.on('listening', () => {
        //     console.log(`server listening ${this.bus.address().address}:${this.bus.address().port}`);
        // })

        // this.bus.bind(3671, () => {
        //      socket.addMembership('224.0.23.12')
        // })

        // this.bus.on('message', (msg, rinfo) => {
        //     console.log('bus message', msg)
        // })

        bus.on('message', (msg, rinfo) => {
            console.log('message from bus', msg, rinfo)
        })

        tunnel.on('message', (msg, rinfo) => {
            console.log('message from tunnel', msg, rinfo)
        })
    }

    public static async connect(path: string, ip?: string, port?: number): Promise<Knx> {
        const schema = JSON.parse(await fs.promises.readFile(path, { encoding: 'utf-8' }))

        const targetPort: number = port || schema.port || 3671
        const targetIp: string = ip || schema.ip || ''
        if (targetIp) {
            return new Promise((resolve, reject) => {
                const send: Socket = createSocket('udp4')            
                send.connect(targetPort, targetIp, () => {
                    const recv = createSocket('udp4')
                    recv.bind(0, send.address().address, () => {
                        new IPGateway(send, recv).connect().then(gateway => {
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
        this.send(KnxServiceType.CONNECTION_REQUEST, [this.hpai(this.bus.address()), this.hpai(this.tunnel.address()), Buffer.from([0x04, 0x04, 0x02, 0x00])])
        
        return this
    }

    private hpai (local: AddressInfo): Buffer {
        return Buffer.from([0x08, 0x01, ...local.address.split(/./g).map(oct => +oct), (local.port & 0xff00) >> 8, local.port & 0xff])
    }

    public async send(service: KnxServiceType, blocks: Buffer[]): Promise<number> {
        const message = Buffer.concat([Buffer.from([0x06, 0x10, KnxServiceDescriptor[service][0], KnxServiceDescriptor[service][1], 0, 6]), ...blocks])
        message.writeUInt16BE(message.length, 4)
        console.log('send to bus', message)
        
        return new Promise((resolve, reject) => {
            this.bus.send(message, (error, bytes) => error ? reject(error) : resolve(bytes))
        })
    }

    public removeEventListener(eventType: KnxEventType, cb: KnxMessageCallback): void {

    }

    public addEventListener(eventType: KnxEventType, cb: KnxMessageCallback): void {

    }
}