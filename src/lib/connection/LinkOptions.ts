import EventEmitter from 'events'

export type KnxLinkOptions = {

    /**
     * Maximum number of cemi frames to sent before waiting for gateway acknowledgement.
     * Decrease if there are readValue timeouts.
     */
    maxConcurrentMessages: number

    /**
     * Maximum telegrams per second rate
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
    events: EventEmitter

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
