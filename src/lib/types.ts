import { KnxErrorCode, KnxServiceId } from './enums'

export type KnxReading<T> = {
    target: string
    source: string
    text: string
    unit: string
    value: T
}

export type KnxLinkExceptionDetails = {
    knxErrorCode?: KnxErrorCode
    serviceId?: KnxServiceId
    address?: string
    channel?: number
}

export enum KnxLinkExceptionCode {
    E_NOT_A_CONNECTION_RESPONSE,
    E_CONNECTION_TIMEOUT,
    E_CONNECTION_ERROR,
    E_NO_CONNECTION,
    E_READ_TIMEOUT
}

export class KnxLinkException extends Error {
    public constructor (message: string, public readonly code: KnxLinkExceptionCode, public readonly details: KnxLinkExceptionDetails) {
        super(`KnxLink Exception: ${message}`)
    }
}
