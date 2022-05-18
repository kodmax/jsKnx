import { KnxConnectionType, KnxServiceId, KnxLayer, KnxIpProtocol } from "../enums";

import { AddressInfo } from "net";
import { Socket } from "dgram";

export class Message {
    public constructor(private readonly socket: Socket, private readonly serviceId: KnxServiceId, private readonly blocks: Buffer[]) {
        //
    }

    public getSocket(): Socket {
        return this.socket
    }

    public static cri(type: KnxConnectionType, layer: KnxLayer): Buffer {
        return Buffer.from([0x04, type, layer, 0x00])
    }

    public static hpai (socket: Socket): Buffer {
        const { address, port } = socket.address()
        
        return Buffer.from([0x08, KnxIpProtocol.IPV4_UDP, ...address.split(/\./g).map(oct => +oct), (port & 0xff00) >> 8, port & 0xff])
    }

    public async send(): Promise<number> {
        const message = Buffer.concat([Buffer.from([0x06, 0x10, (this.serviceId & 0xff00) >> 8, this.serviceId & 0xff, 0, 6]), ...this.blocks])
        message.writeUInt16BE(message.length, 4)
        console.log('message', message)

        return new Promise((resolve, reject) => {
            this.socket.send(message, (error, bytes) => error ? reject(error) : resolve(bytes))
        })
    }
}