import { KnxLinkException, KnxReading, KnxDatapointLink, RequiredKnxLinkOptions } from '@repo/knx-common'
import { KnxCemiFrame } from '@repo/knx-common'
import { APCI, DPT, KnxCemiCode } from '@repo/knx-enums'
import EventEmitter from 'events'

interface IDPT {
    readonly type: DPT
    readonly unit: string
    read(): Promise<KnxReading<unknown>>
    requestValue(): Promise<void>
    addWriteListener(cb: (reading: KnxReading<unknown>) => void): void
    removeWriteListener(cb: (reading: KnxReading<unknown>) => void): void
    addResponseListener(cb: (reading: KnxReading<unknown>) => void): void
    removeResponseListener(cb: (reading: KnxReading<unknown>) => void): void
    onValue(cb: (reading: KnxReading<unknown>) => void): void
    offValue(cb: (reading: KnxReading<unknown>) => void): void
    getAddress(): string
    getLink(): KnxDatapointLink<KnxCemiFrame>
    toString(value?: unknown): string
}

/**
 * Base class for typed KNX group clients (DPT implementations).
 *
 * Instances are created via `KnxLink.group()`. Subclasses define encoding,
 * decoding, and DPT-specific write helpers.
 *
 * @typeParam T Decoded value type for this DPT.
 */
export abstract class DataPointAbstract<T> implements IDPT {
    protected cemiFrameEvent: EventEmitter = new EventEmitter()
    protected valueEvent: EventEmitter = new EventEmitter()
    protected hasSubscribed = false
    private pendingReadReject?: (error: KnxLinkException) => void

    protected abstract valueByteLength: number
    /** KNX datapoint type identifier (e.g. `1.001`). */
    public abstract readonly type: DPT
    /** Display unit for numeric values; empty string when not applicable. */
    public abstract readonly unit: string

    protected abstract decode(data: Buffer, cemiFrame: KnxCemiFrame): T

    /** Send a group write with a DPT-encoded value. */
    protected abstract write(value: T): Promise<void>

    /** Format a decoded value for display; without `value`, returns address and DPT id. */
    public abstract toString(value?: T): string

    /** Subscribe to incoming group writes (`APCI_GROUP_VALUE_WRITE`) for this address. */
    public addWriteListener(cb: (reading: KnxReading<T>) => void): void {
        this.valueEvent.addListener('value-received', cb)
        this.updateSubscription()
    }

    /** Remove a listener previously added with {@link addWriteListener} or {@link onValue}. */
    public removeWriteListener(cb: (reading: KnxReading<T>) => void): void {
        this.valueEvent.removeListener('value-received', cb)
        this.updateSubscription()
    }

    /** Subscribe to group-read responses (`APCI_GROUP_VALUE_RESP`), e.g. after {@link requestValue}. */
    public addResponseListener(cb: (reading: KnxReading<T>) => void): void {
        this.valueEvent.addListener('resp-received', cb)
        this.updateSubscription()
    }

    /** Remove a listener previously added with {@link addResponseListener} or {@link onValue}. */
    public removeResponseListener(cb: (reading: KnxReading<T>) => void): void {
        this.valueEvent.removeListener('resp-received', cb)
        this.updateSubscription()
    }

    /** Subscribe to both group writes and read responses with one callback. */
    public onValue(cb: (reading: KnxReading<T>) => void): void {
        this.addWriteListener(cb)
        this.addResponseListener(cb)
    }

    /** Remove a listener previously added with {@link onValue}. */
    public offValue(cb: (reading: KnxReading<T>) => void): void {
        this.removeWriteListener(cb)
        this.removeResponseListener(cb)
    }

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

    /** Send a group-read telegram without waiting for a response. */
    public async requestValue(): Promise<void> {
        await this.link.sendCemiFrame(KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Request, '0.0.0', this.address))
    }

    /**
     * Send a group read and wait for a response.
     *
     * @throws `READ_TIMEOUT` when no response arrives within the link `readTimeout`.
     */
    public async read(): Promise<KnxReading<T>> {
        await this.requestValue()
        return await new Promise((resolve, reject) => {
            const cleanup = (): void => {
                clearTimeout(timeoutId)
                this.valueEvent.removeListener('resp-received', recv)
                this.pendingReadReject = undefined
                this.updateSubscription()
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
            this.updateSubscription()

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

    /** Return the parent KNX link used for bus communication. */
    public getLink(): KnxDatapointLink<KnxCemiFrame> {
        return this.link
    }

    public constructor(
        protected readonly address: string,
        private readonly link: KnxDatapointLink<KnxCemiFrame>,
        private readonly options: RequiredKnxLinkOptions
    ) {}

    /** Return the bound group address (e.g. `2/0/4`). */
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

    protected updateSubscription(): void {
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
