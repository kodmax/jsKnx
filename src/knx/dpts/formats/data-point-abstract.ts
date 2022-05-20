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
        await KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingRequest.compose(this.connection.getChannel()), KnxCemiFrame.compose(KnxCemiCode["L_Data.req"], "0.0.0", this.address, data)]).send(this.connection.getTunnel())
    }

    public async requestValue(): Promise<void> {
        await KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingRequest.compose(this.connection.getChannel()), KnxCemiFrame.compose(KnxCemiCode["L_Poll_Data.req"], "0.0.0", this.address, Buffer.alloc(0))]).send(this.connection.getTunnel())
    }

    public constructor(protected connection: KnxConnection, protected readonly address: string, protected readonly events: EventEmitter) {
        events.on("tunnel-request", (cemiFrame: KnxCemiFrame) => {
            if (cemiFrame.target === address) {
                this.valueEvent.emit("value", this.decode(cemiFrame.value), this.unit, cemiFrame.source)
            }
        })
    }
}