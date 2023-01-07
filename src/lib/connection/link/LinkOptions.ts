import EventEmitter from 'events'
import { KnxCemiFrame } from '../../message'
import { KnxLinkException } from '../../types'

export type CemiFrameEventArguments = [KnxCemiFrame]
export type ErrorEventArguments = [KnxLinkException]

export interface KnxEventEmitter extends EventEmitter {
    addListener(eventName: 'error', listener: (...args: ErrorEventArguments) => void): this
    once(eventName: 'error', listener: (...args: ErrorEventArguments) => void): this
    on(eventName: 'error', listener: (...args: ErrorEventArguments) => void): this
    emit(eventName: 'error', ...args: ErrorEventArguments): boolean

    addListener(eventName: 'cemi-frame', listener: (...args: CemiFrameEventArguments) => void): this
    once(eventName: 'cemi-frame', listener: (...args: CemiFrameEventArguments) => void): this
    on(eventName: 'cemi-frame', listener: (...args: CemiFrameEventArguments) => void): this
    emit(eventName: 'cemi-frame', ...args: CemiFrameEventArguments): boolean
}

export type KnxLinkOptions = {

    /**
     * Maximum number of cemi frames to sent before waiting for gateway acknowledgement.
     */
    maxConcurrentMessages: number
    /**
     * Maximum telegrams per second rate.
     * Decrease if there are readValue timeouts.
     */
    maxTelegramsPerSecond: number

    /**
     * Default 10000ms, applied to read() method. May be increased for busy networks or decreased to tiny ones.
     */
    readTimeout: number

    /**
     * When not specified, standard 3671 is used
     */
    port: number

    /**
     * Event bus to use internally, may be useful to tap into low level knx messages
     */
    events: KnxEventEmitter

    /**
     * Maximum number of retries on IP network failure.
     */
    maxRetry: number

    /**
     * How long to pause when error occurs
     */
    retryPause: number

    connectionTimeout: number
}
