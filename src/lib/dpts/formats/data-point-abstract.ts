import EventEmitter from "events"
import { KnxGroupSchema, KnxLink } from "../../connection"
import { KnxConnection } from "../../connection/connection"
import { APCI, DPT, KnxCemiCode, KnxServiceId } from "../../enums"
import { KnxCemiFrame, KnxIpMessage, TunnelingRequest } from "../../message"

export interface IDPT {}
export abstract class DataPointAbstract<T> implements IDPT {
    protected cemiFrameEvent: EventEmitter = new EventEmitter()
    protected valueEvent: EventEmitter = new EventEmitter()
    protected hasSubscribed = false

    public abstract readonly unit: string
    public abstract readonly type: DPT

    protected abstract toString(value?: T): string
    protected abstract write(value: T): Promise<void>
    protected abstract decode(data: Buffer): T

    protected async send(value: Buffer): Promise<void> {
        const linkInfo = this.link.getLinkInfo()
        const telegram = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [ TunnelingRequest.compose(linkInfo.channel), 
            KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Request, "0.0.0", this.address, value)
        ])

        await telegram.send(this.connection.getTunnel())
        
    }

    public async requestValue(): Promise<void> {
        const linkInfo = this.link.getLinkInfo()
        const telegram = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [ TunnelingRequest.compose(linkInfo.channel), 
            KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Request, "0.0.0", this.address)
        ])
        
        await telegram.send(this.connection.getTunnel())
    }

    public getLink(): KnxLink {
        return this.link
    }

    public constructor(protected readonly address: string, protected connection: KnxConnection, private readonly link: KnxLink, private readonly events?: EventEmitter) {

    }

    private eventsListener = (cemiFrame: KnxCemiFrame) => {
        if (cemiFrame.target === this.address) {
            this.cemiFrameEvent.emit(APCI [cemiFrame.getService()], cemiFrame)

            switch (cemiFrame.getService()) {
            case APCI.APCI_GROUP_VALUE_WRITE: case APCI.APCI_GROUP_VALUE_RESP:
                this.valueEvent.emit("value-received", this.decode(cemiFrame.value), this.unit, cemiFrame.source)
                break

            default:
            }
        }
    }

    protected updateSubscription(eventName: string): void {
        if (this.events) {
            if (this.valueEvent.listenerCount(eventName) === 0 && this.hasSubscribed) {
                this.events.off("cemi-frame", this.eventsListener)
                this.hasSubscribed = false

            } else if (this.valueEvent.listenerCount(eventName) === 1 && !this.hasSubscribed) {
                this.events.on("cemi-frame", this.eventsListener)
                this.hasSubscribed = true
            }
        }
    }
}