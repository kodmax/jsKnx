import EventEmitter from "events"

export type KnxLinkOptions = {

    /**
     * Default 3000ms, applied to read() method. May be increased for busy networks or decreased to tiny ones.
     */
    readTimeout?: number

    /**
     * When not specified, standard 3671 is used
     */
    port?: number

    /**
     * Event bus to use internally, may be useful to tap into low level knx messages
     */
    events?: EventEmitter
}

export type KnxReading<T> = {
    source: string
    text: string
    unit: string
    value: T
}
