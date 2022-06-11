import EventEmitter from "events"
import { KnxErrorCode } from "./enums"

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

export type KnxLinkExceptionDetails = {
    knxErrorCode?: KnxErrorCode
    address?: string
}

export enum KnxLinkExceptionCode {
    E_CONNECTION_ERROR,
    E_READ_TIMEOUT
}

export class KnxLinkException extends Error {
    public constructor(message: string, public readonly code: KnxLinkExceptionCode, public readonly details: KnxLinkExceptionDetails) {
        super(`KnxLink Exception: ${code}. ${message}.`)
    }
}