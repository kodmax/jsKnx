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

    public group<T extends IDPT>(address: string, DataPointType: new(address: string, connection: KnxConnection, link: KnxLink, events?: EventEmitter) => T): T {
        return new DataPointType(address, this.connection, this.link, this.events)
    }

    public constructor(protected readonly address: string, protected connection: KnxConnection, private readonly link: KnxLink, private readonly events?: EventEmitter) {

    }

    private eventsListener = (cemiFrame: KnxCemiFrame) => {
        if (cemiFrame.target === this.address) {
            this.valueEvent.emit("value", this.decode(cemiFrame.value), this.unit, cemiFrame.source)
        }
    }

    protected updateSubscription(eventName: string): void {
        if (this.events) {
            if (this.valueEvent.listenerCount(eventName) === 1) {
                this.events.on("tunnel-request", this.eventsListener)

            } else if (this.valueEvent.listenerCount(eventName) === 0) {
                this.events.on("tunnel-request", this.eventsListener)
            }
        }
    }
}