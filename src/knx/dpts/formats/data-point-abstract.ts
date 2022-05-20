import EventEmitter from "events"
import { KnxLink } from "../../connection"
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

    protected async send(value: Buffer): Promise<void> {
        const linkInfo = this.link.getLinkInfo()
        const telegram = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [ TunnelingRequest.compose(linkInfo.channel), 
            KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Request, '0.0.0', this.address, value)
        ])

        await telegram.send(this.connection.getTunnel())
        
    }

    public async requestValue(): Promise<void> {
        const linkInfo = this.link.getLinkInfo()
        const telegram = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [ TunnelingRequest.compose(linkInfo.channel), 
            KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Request, '0.0.0', this.address)
        ])
        
        await telegram.send(this.connection.getTunnel())
    }

    public constructor(protected connection: KnxConnection, protected readonly address: string, protected readonly events: EventEmitter, private readonly link: KnxLink) {
        events.on("tunnel-request", (cemiFrame: KnxCemiFrame) => {
            if (cemiFrame.target === address) {
                this.valueEvent.emit("value", this.decode(cemiFrame.value), this.unit, cemiFrame.source)
            }
        })
    }
}