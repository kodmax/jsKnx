import { KnxLinkException, KnxReading } from '../../types'
import { KnxLink, KnxConnection, KnxLinkOptions } from '../../connection'
import { APCI, DPT, KnxCemiCode } from '../../enums'
import { KnxCemiFrame } from '../../message'
import EventEmitter from 'events'

export interface IDPT {}
export abstract class DataPointAbstract<T> implements IDPT {
    protected cemiFrameEvent: EventEmitter = new EventEmitter()
    protected valueEvent: EventEmitter = new EventEmitter()
    protected hasSubscribed = false

    protected abstract valueByteLength: number
    public abstract readonly unit: string
    public abstract readonly type: DPT

    protected abstract decode(data: Buffer, cemiFrame: KnxCemiFrame): T
    protected abstract write(value: T): Promise<void>

    public abstract addValueListener(cb: (reading: KnxReading<T>) => void): void
    public abstract toString(value?: T): string

    protected isCemiFrameValueByteLengthOk (cemiFrame: KnxCemiFrame): boolean {
        if (cemiFrame.value.byteLength !== this.valueByteLength) {
            this.options.events.emit(
                'error',
                new KnxLinkException(
                    'DATA_LENGTH_MISMATCH',
                    `Invalid cEMI frame data length for group <${cemiFrame.target}> received from <${cemiFrame.source}>`, {
                        actualDataLength: cemiFrame.value.byteLength,
                        expectedDataType: this.type,
                        source: cemiFrame.source,
                        data: cemiFrame.value,
                        target: this.address
                    })
            )

            return false

        } else {
            return true
        }
    }

    protected async send (value: Buffer): Promise<void> {
        await this.link.sendCemiFrame(
            KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Request, '0.0.0', this.address, value)
        )
    }

    public async requestValue (): Promise<void> {
        await this.link.sendCemiFrame(
            KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Request, '0.0.0', this.address)
        )
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

                reject(new KnxLinkException('READ_TIMEOUT', `Timeout waiting for ${this.address} response`, {
                    address: this.address
                }))
            }, this.options.readTimeout)
        })
    }

    public getLink (): KnxLink {
        return this.link
    }

    public constructor (
        protected readonly address: string,
        protected readonly connection: KnxConnection,
        private readonly link: KnxLink,
        private readonly options: KnxLinkOptions
    ) {

    }

    public getAddress (): string {
        return this.address
    }

    private eventsListener = (cemiFrame: KnxCemiFrame) => {
        if (cemiFrame.target === this.address) {
            this.cemiFrameEvent.emit(APCI [cemiFrame.getService()], cemiFrame)

            switch (cemiFrame.getService()) {
                case APCI.APCI_GROUP_VALUE_WRITE: {
                    if (this.isCemiFrameValueByteLengthOk(cemiFrame)) {
                        const value = this.decode(cemiFrame.value, cemiFrame)
                        this.valueEvent.emit('value-received', {
                            text: this.toString(value),
                            source: cemiFrame.source,
                            target: cemiFrame.target,
                            unit: this.unit,
                            value
                        })
                    }

                    break
                }
                case APCI.APCI_GROUP_VALUE_RESP: {
                    if (this.isCemiFrameValueByteLengthOk(cemiFrame)) {
                        const value = this.decode(cemiFrame.value, cemiFrame)
                        this.valueEvent.emit('resp-received', {
                            text: this.toString(value),
                            source: cemiFrame.source,
                            target: cemiFrame.target,
                            unit: this.unit,
                            value
                        })
                    }

                    break
                }

                default:
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected updateSubscription (_eventName: 'value-received' | 'resp-received'): void {
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
