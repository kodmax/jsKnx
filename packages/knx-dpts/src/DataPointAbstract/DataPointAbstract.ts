import { KnxLinkException, KnxReading } from '@js-knx-internal/types'
import { KnxLink, RequiredKnxLinkOptions } from '@js-knx-internal/connection'
import { APCI, DPT, KnxCemiCode } from '@repo/knx-enums'
import { KnxCemiFrame } from '@js-knx-internal/message'
import EventEmitter from 'events'

export interface IDPT {
    readonly type: DPT
    readonly unit: string
    read(): Promise<KnxReading<unknown>>
    requestValue(): Promise<void>
    addValueListener(cb: (reading: KnxReading<unknown>) => void): void
    getAddress(): string
    getLink(): KnxLink
    toString(value?: unknown): string
}

export abstract class DataPointAbstract<T> implements IDPT {
    protected cemiFrameEvent: EventEmitter = new EventEmitter()
    protected valueEvent: EventEmitter = new EventEmitter()
    protected hasSubscribed = false
    private pendingReadReject?: (error: KnxLinkException) => void

    protected abstract valueByteLength: number
    public abstract readonly unit: string
    public abstract readonly type: DPT

    protected abstract decode(data: Buffer, cemiFrame: KnxCemiFrame): T
    protected abstract write(value: T): Promise<void>

    public abstract addValueListener(cb: (reading: KnxReading<T>) => void): void
    public abstract toString(value?: T): string

    protected isCemiFrameValueByteLengthOk(cemiFrame: KnxCemiFrame): boolean {
        if (cemiFrame.value.byteLength !== this.valueByteLength) {
            const error = new KnxLinkException(
                'DATA_LENGTH_MISMATCH',
                `Invalid cEMI frame data length for group <${cemiFrame.target}> received from <${cemiFrame.source}>`,
                {
                    actualDataLength: cemiFrame.value.byteLength,
                    expectedDataType: this.type,
                    source: cemiFrame.source,
                    data: cemiFrame.value,
                    target: this.address
                }
            )

            if (cemiFrame.getService() === APCI.APCI_GROUP_VALUE_RESP && this.pendingReadReject) {
                this.pendingReadReject(error)
            }

            // Non-fatal: KnxTunnel wraps cemi-frame delivery in try/catch. emit('error') throw is swallowed there.
            // on('error') is optional — read() still rejects via pendingReadReject when applicable.
            this.link.emit('error', error)

            return false
        } else {
            return true
        }
    }

    protected async send(value: Buffer): Promise<void> {
        await this.link.sendCemiFrame(KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Request, '0.0.0', this.address, value))
    }

    public async requestValue(): Promise<void> {
        await this.link.sendCemiFrame(KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Request, '0.0.0', this.address))
    }

    public async read(): Promise<KnxReading<T>> {
        await this.requestValue()
        return await new Promise((resolve, reject) => {
            const cleanup = (): void => {
                clearTimeout(timeoutId)
                this.valueEvent.removeListener('resp-received', recv)
                this.pendingReadReject = undefined
                this.updateSubscription('resp-received')
            }

            const recv = (reading: KnxReading<T>) => {
                cleanup()
                resolve(reading)
            }

            this.pendingReadReject = (error: KnxLinkException) => {
                cleanup()
                reject(error)
            }

            this.valueEvent.addListener('resp-received', recv)
            this.updateSubscription('resp-received')

            const timeoutId = setTimeout(() => {
                cleanup()
                reject(
                    new KnxLinkException('READ_TIMEOUT', `Timeout waiting for ${this.address} response`, {
                        address: this.address
                    })
                )
            }, this.options.readTimeout)
        })
    }

    public getLink(): KnxLink {
        return this.link
    }

    public constructor(
        protected readonly address: string,
        private readonly link: KnxLink,
        private readonly options: RequiredKnxLinkOptions
    ) {}

    public getAddress(): string {
        return this.address
    }

    private eventsListener = (cemiFrame: KnxCemiFrame) => {
        if (cemiFrame.target === this.address) {
            this.cemiFrameEvent.emit(APCI[cemiFrame.getService()], cemiFrame)

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
    protected updateSubscription(_eventName: 'value-received' | 'resp-received'): void {
        const lc = this.valueEvent.listenerCount('value-received') + this.valueEvent.listenerCount('resp-received')

        if (lc === 0 && this.hasSubscribed) {
            this.link.off('cemi-frame', this.eventsListener)
            this.hasSubscribed = false
        } else if (lc === 1 && !this.hasSubscribed) {
            this.link.on('cemi-frame', this.eventsListener)
            this.hasSubscribed = true
        }
    }
}
