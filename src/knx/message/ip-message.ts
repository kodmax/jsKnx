import { KnxServiceId,  } from "../enums";
import { KnxMessage } from "./cemi-frame";
import { Socket } from "dgram";

export class KnxIpMessage {
    private readonly serviceId: KnxServiceId
    private readonly body: Buffer

    private constructor(private readonly message: Buffer) {
        this.serviceId = message.readUint16BE(2)
        this.body = message.slice(6)
    }

    public getServiceId(): KnxServiceId {
        return this.serviceId
    }

    public static decode(message: Buffer): KnxIpMessage {
        if (message.readUint16BE(0) !== 0x0610 || message.readUint16BE(4) !== message.length) {
            throw new Error('Invalid or corrupted message')
        }

        return new KnxIpMessage(message)
    }

    public static compose(serviceId: KnxServiceId, blocks: Buffer[]): KnxIpMessage {
        const message = Buffer.concat([Buffer.from([0x06, 0x10, (serviceId & 0xff00) >> 8, serviceId & 0xff, 0, 6]), ...blocks])
        message.writeUInt16BE(message.length, 4)

        return new KnxIpMessage(message)
    }

    public async send(socket: Socket): Promise<number> {
        return new Promise((resolve, reject) => {
            socket.send(this.message, (error, bytes) => error ? reject(error) : resolve(bytes))
        })
    }

    public getSequenceNumber() {
        return this.message.readUint8(8)
    }

    public getChannel() {
        return this.message.readUint8(7)
    }
    
    public getConnectionHeader(): Buffer {
        return this.message.slice(6, 10)
    }

    public hasCemiFrame(): boolean {
        if (this.serviceId === KnxServiceId.TUNNEL_REQUEST) {
            return this.message.slice(22).length > 0

        } else {
            throw new Error('Invalid Service')
        }
    }

    public getCemiFrame(): KnxMessage {
        if (this.serviceId === KnxServiceId.TUNNEL_REQUEST) {
            return new KnxMessage(this.message.slice(22))

        } else {
            throw new Error('Invalid Service')
        }
    }

    public dump(prefix: string): void {
        console.log(prefix, KnxServiceId [this.serviceId], this.body)
    }
}