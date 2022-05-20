import EventEmitter from "events"
import { KnxConnection } from "../../connection/connection"
import { DPT, KnxCemiCode, KnxServiceId } from "../../enums"
import { KnxCemiFrame, KnxIpMessage, TunnelingRequest } from "../../message"

export interface IDPT {}
export abstract class DataPointAbstract<T> implements IDPT {
    protected valueEvent: EventEmitter = new EventEmitter()
    public abstract readonly unit: string
    public abstract readonly type: DPT

    protected abstract write(value: T): Promise<void>
    protected abstract decode(data: Buffer): T

    protected async send(data: Buffer): Promise<void> {
        const telegram = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingRequest.compose(this.connection.getChannel()), KnxCemiFrame.compose(KnxCemiCode.L_Data_Request, "15.15.255", this.address, data)])
        console.log('write', telegram.getBuffer())
        await telegram.send(this.connection.getTunnel())
    }

    public async requestValue(): Promise<void> {
        const telegram = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingRequest.compose(this.connection.getChannel()), KnxCemiFrame.compose(KnxCemiCode.L_Poll_Data_Request, "1.1.1", this.address, Buffer.from([0]))])
        // console.log('request', telegram.getBuffer())
        await telegram.send(this.connection.getGateway())
    }

    public constructor(protected connection: KnxConnection, protected readonly address: string, protected readonly events: EventEmitter) {
        events.on("tunnel-request", (cemiFrame: KnxCemiFrame) => {
            if (cemiFrame.target === address) {
                this.valueEvent.emit("value", this.decode(cemiFrame.value), this.unit, cemiFrame.source)
            }
        })
    }
}