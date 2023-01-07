import { DPT, KnxErrorCode, KnxServiceId } from './enums'

export type KnxReading<T> = {
    target: string
    source: string
    text: string
    unit: string
    value: T
}

export type KnxLinkExceptionDetails = {
    actualDataLength: number
    expectedDataType: DPT
    knxErrorCode: KnxErrorCode
    serviceId: KnxServiceId
    address: string
    channel: number
    source: string
    value: any
}

export type KnxLinkExceptionCode = 'NOT_A_CONNECTION_RESPONSE'
| 'DATA_LENGTH_MISMATCH'
| 'CONNECTION_TIMEOUT'
| 'CONNECTION_ERROR'
| 'INVALID_VALUE'
| 'NO_CONNECTION'
| 'READ_TIMEOUT'

export class KnxLinkException extends Error {
    public constructor(code: 'NOT_A_CONNECTION_RESPONSE', message: string, details: {
        serviceId: KnxServiceId
    })

    public constructor(code: 'DATA_LENGTH_MISMATCH', message: string, details: {
        actualDataLength: number
        expectedDataType: DPT
        address: string
        source: string
    })

    public constructor(code: 'CONNECTION_ERROR', message: string, details: { knxErrorCode: KnxErrorCode })
    public constructor(code: 'READ_TIMEOUT', message: string, details: { address: string })
    public constructor(code: 'INVALID_VALUE', message: string, details: { value: any })
    public constructor(code: 'CONNECTION_TIMEOUT', message: string, details: {})
    public constructor(code: 'NO_CONNECTION', message: string, details: {})
    public constructor (public readonly code: KnxLinkExceptionCode, message: string, public readonly details: Partial<KnxLinkExceptionDetails>) {
        super(`KnxLink Exception: ${message}`)
    }
}
