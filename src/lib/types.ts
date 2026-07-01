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
    target: string
    channel: number
    source: string
    value: unknown
    data: Buffer
}

export type KnxLinkExceptionCode =
    | 'NOT_A_CONNECTION_RESPONSE'
    | 'DATA_LENGTH_MISMATCH'
    | 'CONNECTION_TIMEOUT'
    | 'CONNECTION_ERROR'
    | 'INVALID_VALUE'
    | 'NO_CONNECTION'
    | 'READ_TIMEOUT'
    | 'CONNECTION_ALREADY_ESTABLISHED'
    | 'CONNECTION_IN_PROGRESS'
    | 'PROTOCOL_ERROR'

export class KnxLinkException extends Error {
    public constructor(
        code: 'NOT_A_CONNECTION_RESPONSE',
        message: string,
        details: {
            serviceId: KnxServiceId
        }
    )

    public constructor(
        code: 'DATA_LENGTH_MISMATCH',
        message: string,
        details: {
            actualDataLength: number
            expectedDataType: DPT
            target: string
            source: string
            data: Buffer
        }
    )

    public constructor(code: 'CONNECTION_ERROR', message: string, details: { knxErrorCode: KnxErrorCode })
    public constructor(code: 'READ_TIMEOUT', message: string, details: { address: string })
    public constructor(code: 'INVALID_VALUE', message: string, details: { value: unknown })
    public constructor(code: 'PROTOCOL_ERROR', message: string, details: { data: Buffer })
    public constructor(code: 'CONNECTION_TIMEOUT', message: string, details: {})
    public constructor(code: 'NO_CONNECTION', message: string, details: {})
    public constructor(code: 'CONNECTION_ALREADY_ESTABLISHED', message: string, details: {})
    public constructor(code: 'CONNECTION_IN_PROGRESS', message: string, details: {})
    public constructor(
        public readonly code: KnxLinkExceptionCode,
        message: string,
        public readonly details: Partial<KnxLinkExceptionDetails>
    ) {
        super(`KnxLink Exception: ${message}`)
    }
}
