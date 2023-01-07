import { DPT, KnxErrorCode, KnxServiceId } from './enums'

export type KnxReading<T> = {
    target: string
    source: string
    text: string
    unit: string
    value: T
}

export type KnxLinkExceptionDetails = {
    expectedDataType: DPT
    dataLength: number
    knxErrorCode: KnxErrorCode
    serviceId: KnxServiceId
    address: string
    channel: number
    source: string
}

export enum KnxLinkExceptionCode {
    E_NOT_A_CONNECTION_RESPONSE,
    E_DATA_LENGTH_MISMATCH,
    E_CONNECTION_TIMEOUT,
    E_CONNECTION_ERROR,
    E_NO_CONNECTION,
    E_READ_TIMEOUT
}

export class KnxLinkException extends Error {
    public constructor(code: KnxLinkExceptionCode.E_NOT_A_CONNECTION_RESPONSE, message: string, details: {
        serviceId: KnxServiceId
    })

    public constructor(code: KnxLinkExceptionCode.E_DATA_LENGTH_MISMATCH, message: string, details: {
        expectedDataType: DPT
        dataLength: number
        address: string
        source: string
    })

    public constructor(code: KnxLinkExceptionCode.E_CONNECTION_TIMEOUT, message: string, details: {})

    public constructor(code: KnxLinkExceptionCode.E_CONNECTION_ERROR, message: string, details: {
        knxErrorCode: KnxErrorCode
    })

    public constructor(code: KnxLinkExceptionCode.E_NO_CONNECTION, message: string, details: {
        channel: number
    })

    public constructor(code: KnxLinkExceptionCode.E_READ_TIMEOUT, message: string, details: {
        address: string
    })

    public constructor (public readonly code: KnxLinkExceptionCode, message: string, public readonly details: Partial<KnxLinkExceptionDetails>) {
        super(`KnxLink Exception: ${message}`)
    }
}
