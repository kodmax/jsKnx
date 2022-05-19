import { KnxServiceId,  } from "../enums";

import { Socket } from "dgram";

export { hpai } from "./hpai"
export { cri } from "./cri"

export class KnxMessage {
    private readonly serviceId: KnxServiceId
    private readonly body: Buffer

    private constructor(private readonly message: Buffer) {
        this.serviceId = message.readUint16BE(2)
        this.body = message.slice(6)
    }

    public getServiceId(): KnxServiceId {
        return this.serviceId
    }

    public static decode(message: Buffer): KnxMessage {
        if (message.readUint16BE(0) !== 0x0610 || message.readUint16BE(4) !== message.length) {
            throw new Error('Invalid or corrupted message')
        }

        return new KnxMessage(message)
    }

    public static compose(serviceId: KnxServiceId, blocks: Buffer[]): KnxMessage {
        const message = Buffer.concat([Buffer.from([0x06, 0x10, (serviceId & 0xff00) >> 8, serviceId & 0xff, 0, 6]), ...blocks])
        message.writeUInt16BE(message.length, 4)

        return new KnxMessage(message)
    }

    public async send(socket: Socket): Promise<number> {
        return new Promise((resolve, reject) => {
            socket.send(this.message, (error, bytes) => error ? reject(error) : resolve(bytes))
        })
    }

    public dump(prefix: string): void {
        console.log(prefix, KnxServiceId [this.serviceId], this.body)
    }
}