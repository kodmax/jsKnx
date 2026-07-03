import { KnxServiceId } from '@repo/knx-enums'
import { KnxLinkException } from '@repo/knx-common'

export class KnxIpMessage {
    private readonly serviceId: KnxServiceId

    private constructor(private readonly message: Buffer) {
        this.serviceId = message.readUint16BE(2)
    }

    public getServiceId(): KnxServiceId {
        return this.serviceId
    }

    public static decode(message: Buffer): KnxIpMessage {
        if (message.readUint16BE(0) !== 0x0610 || message.readUint16BE(4) !== message.length) {
            throw new KnxLinkException('PROTOCOL_ERROR', 'Invalid or corrupted KNX/IP message', { data: message })
        }

        return new KnxIpMessage(message)
    }

    public static compose(serviceId: KnxServiceId, blocks: Buffer[]): KnxIpMessage {
        const message = Buffer.concat([Buffer.from([0x06, 0x10, (serviceId & 0xff00) >> 8, serviceId & 0xff, 0, 6]), ...blocks])
        message.writeUInt16BE(message.length, 4)

        return new KnxIpMessage(message)
    }

    public getBody(index = 0): Buffer {
        return this.message.subarray(6 + index)
    }

    public getBuffer(): Buffer {
        return this.message
    }

    public getSequence(): number {
        return this.message.readUInt8(8)
    }
}
