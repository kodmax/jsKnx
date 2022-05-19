import { KnxServiceId,  } from "../enums";

import { Socket } from "dgram";

export { hpai } from "./hpai"
export { cri } from "./cri"

export class Message {
    private readonly serviceId: number
    private readonly body: Buffer

    private constructor(private readonly message: Buffer) {
        this.serviceId = message.readUint16BE(2)
        this.body = message.slice(6)
    }

    public static decode(message: Buffer): Message {
        if (message.readUint16BE(0) !== 0x0610 || message.readUint16BE(4) !== message.length) {
            throw new Error('Invalid or corrupted message')
        }

        return new Message(message)
    }

    public static compose(serviceId: KnxServiceId, blocks: Buffer[]): Message {
        const message = Buffer.concat([Buffer.from([0x06, 0x10, (serviceId & 0xff00) >> 8, serviceId & 0xff, 0, 6]), ...blocks])
        message.writeUInt16BE(message.length, 4)

        return new Message(message)
    }

    public async send(socket: Socket): Promise<number> {
        return new Promise((resolve, reject) => {
            socket.send(this.message, (error, bytes) => error ? reject(error) : resolve(bytes))
        })
    }

    public dump(): void {
        console.log(KnxServiceId [this.serviceId], this.body)
    }
}