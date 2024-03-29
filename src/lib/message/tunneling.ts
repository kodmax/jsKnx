import { KnxCemiCode, KnxServiceId } from '../enums'
import { KnxIpMessage } from './ip-message'

export class TunnelingRequest {

    public constructor (private readonly frame: Buffer) {
        if (frame.readUint8(0) !== 0x4 || frame.readUint8(3) !== 0x0) {
            throw new Error('Invalid Tunneling Request Frame')
        }
    }

    public static compose (channel: number, seq: number): Buffer {
        return Buffer.from([0x04, channel, seq, 0x00])
    }

    public getChannel () {
        return this.frame.readUint8(1)
    }

    public getSequenceNumber () {
        return this.frame.readUint8(2)
    }

    public ack (): KnxIpMessage {
        return KnxIpMessage.compose(KnxServiceId.TUNNEL_RESPONSE, [Buffer.from([0x04, this.getChannel(), this.getSequenceNumber(), 0x00])])
    }

    public getBody () {
        return this.frame.slice(4)
    }

    public getCemiCode (): KnxCemiCode {
        return this.frame.readUInt8(4)
    }
}
