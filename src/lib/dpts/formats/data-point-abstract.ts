import EventEmitter from 'events'
import { KnxLink } from '../../connection'
import { KnxConnection } from '../../connection/connection'
import { APCI, DPT, KnxCemiCode, KnxServiceId } from '../../enums'
import { KnxCemiFrame, KnxIpMessage, TunnelingRequest } from '../../message'
import { KnxLinkException, KnxLinkExceptionCode, KnxLinkOptions, KnxReading } from '../../types'

export interface IDPT {}
export abstract class DataPointAbstract<T> implements IDPT {
    protected cemiFrameEvent: EventEmitter = new EventEmitter()
    protected valueEvent: EventEmitter = new EventEmitter()
    protected hasSubscribed = false

    public abstract readonly unit: string
    public abstract readonly type: DPT

    protected abstract write(value: T): Promise<void>
    protected abstract decode(data: Buffer): T

    public abstract addValueListener(cb: (reading: KnxReading<T>) => void)
    public abstract toString(value?: T): string

    protected async send (value: Buffer): Promise<void> {
        const linkInfo = this.link.getLinkInfo()
        const telegram = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingRequest.compose(linkInfo.channel),
            KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Request, '0.0.0', this.address, value)
        ])

        await this.connection.send(telegram)
    }
s
    public async requestValue (): Promise<void> {
        const linkInfo = this.link.getLinkInfo()
        const telegram = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingRequest.compose(linkInfo.channel),
            KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Request, '0.0.0', this.address)
        ])

        return this.connection.send(telegram)
    }

    public async read (): Promise<KnxReading<T>> {
        await this.requestValue()
        return await new Promise((resolve, reject) => {
            const recv = (reading: KnxReading<T>) => {
                this.valueEvent.removeListener('resp-received', recv)
                this.updateSubscription('resp-received')
                clearTimeout(timeoutId)
                resolve(reading)
            }

            this.valueEvent.addListener('resp-received', recv)
            this.updateSubscription('resp-received')

            const timeoutId = setTimeout(() => {
                this.valueEvent.removeListener('resp-received', recv)
                this.updateSubscription('resp-received')

                reject(new KnxLinkException(`Timeout waiting for ${this.address} response`, KnxLinkExceptionCode.E_READ_TIMEOUT, {
                    address: this.address
                }))
            }, this.options.readTimeout)
        })
    }

    public getLink (): KnxLink {
        return this.link
    }

    public constructor (protected readonly address: string, protected connection: KnxConnection, private readonly link: KnxLink, private readonly options: KnxLinkOptions) {

    }

    private eventsListener = (cemiFrame: KnxCemiFrame) => {
        if (cemiFrame.target === this.address) {
            this.cemiFrameEvent.emit(APCI [cemiFrame.getService()], cemiFrame)

            switch (cemiFrame.getService()) {
                case APCI.APCI_GROUP_VALUE_WRITE: {
                    const value = this.decode(cemiFrame.value)
                    this.valueEvent.emit('value-received', {
                        text: this.toString(value),
                        source: cemiFrame.source,
                        unit: this.unit,
                        value
                    })

                    break
                }
                case APCI.APCI_GROUP_VALUE_RESP: {
                    const value = this.decode(cemiFrame.value)
                    this.valueEvent.emit('resp-received', {
                        text: this.toString(value),
                        source: cemiFrame.source,
                        unit: this.unit,
                        value
                    })

                    break
                }

                default:
            }
        }
    }

    protected updateSubscription (eventName: 'value-received' | 'resp-received'): void {
        if (this.options.events) {
            const lc = this.valueEvent.listenerCount('value-received') + this.valueEvent.listenerCount('resp-received')
            
            if (lc === 0 && this.hasSubscribed) {
                this.options.events.off('cemi-frame', this.eventsListener)
                this.hasSubscribed = false

            } else if (lc === 1 && !this.hasSubscribed) {
                this.options.events.on('cemi-frame', this.eventsListener)
                this.hasSubscribed = true
            }
        }
    }
}
