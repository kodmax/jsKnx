import { Socket } from "dgram"
import { KnxServiceId } from "../enums"
import { KnxIpMessage } from "./ip-message"

export class KnxCemiFrame {
    public constructor(private readonly frame: Buffer) {

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
        console.log(prefix, this.frame)
    }
}