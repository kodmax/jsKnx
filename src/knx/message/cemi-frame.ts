import { Socket } from "dgram"
import { KnxMessageCode, KnxServiceId } from "../enums"
import { KnxIpMessage } from "./ip-message"

function decodeAddress (address: number) {
    return [address >> 12, (address >> 8) & 0xf, address & 0xff]
}
export class KnxCemiFrame {
    public readonly source: string
    public readonly target: string
    public readonly value: Buffer

    public constructor(private readonly frame: Buffer) {
        if (frame.readUint8(0) !== KnxMessageCode ['L_Data.ind']) {
            throw new Error('Not a cEMI frame')
        }

        const source = frame.readUint16BE(4)
        const target = frame.readUint16BE(6)

        this.target = [(target >> 11) & 0xf, (target >> 8) & 0x7, target & 0xff].join('/')
        this.source = [source >> 12, (source >> 8) & 0xf, source & 0xff].join('.')
        this.value = frame.slice(11)
    }

    public getChannel() {
        return this.frame.readUint8(0)
    }
    
    public getSequenceNumber() {
        return this.frame.readUint8(1)
    }

    public async ack(tunnel: Socket): Promise<void> {
        await KnxIpMessage.compose(KnxServiceId.TUNNEL_RESPONSE, [Buffer.from([0x04, this.getChannel(), this.getSequenceNumber(), 0x00])]).send(tunnel)
    }

    public dump(prefix: string): void {
        console.log(prefix, this.source, this.target, this.value)
    }


}