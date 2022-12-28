import { KnxServiceId } from '../enums'

export class KnxIpMessage {
    private readonly serviceId: KnxServiceId
    private readonly body: Buffer

    private constructor (private readonly message: Buffer) {
        this.serviceId = message.readUint16BE(2)
        this.body = message.slice(6)
    }

    public getServiceId (): KnxServiceId {
        return this.serviceId
    }

    public static decode (message: Buffer): KnxIpMessage {
        if (message.readUint16BE(0) !== 0x0610 || message.readUint16BE(4) !== message.length) {
            throw new Error('Invalid or corrupted message')
        }

        return new KnxIpMessage(message)
    }

    public static compose (serviceId: KnxServiceId, blocks: Buffer[]): KnxIpMessage {
        const message = Buffer.concat([Buffer.from([0x06, 0x10, (serviceId & 0xff00) >> 8, serviceId & 0xff, 0, 6]), ...blocks])
        message.writeUInt16BE(message.length, 4)

        return new KnxIpMessage(message)
    }

    public getBody (index = 0): Buffer {
        return this.message.slice(6 + index)
    }

    public getBuffer (): Buffer {
        return this.message
    }
}
