import { DPT, KnxErrorCode, KnxServiceId } from './enums'
import { KnxLinkException, knxNetworkError } from './types'

describe('KnxLinkException', () => {
    it('prefixes message with KnxLink Exception', () => {
        const error = new KnxLinkException('READ_TIMEOUT', 'Timeout waiting for 1/2/3 response', { address: '1/2/3' })

        expect(error.message).toBe('KnxLink Exception: Timeout waiting for 1/2/3 response')
        expect(error.code).toBe('READ_TIMEOUT')
        expect(error.details.address).toBe('1/2/3')
    })

    it('stores DATA_LENGTH_MISMATCH details', () => {
        const data = Buffer.from([0x00, 0x01])
        const error = new KnxLinkException('DATA_LENGTH_MISMATCH', 'Invalid length', {
            actualDataLength: 1,
            expectedDataType: DPT.Generic_U8,
            target: '1/2/3',
            source: '1.1.1',
            data
        })

        expect(error.details.actualDataLength).toBe(1)
        expect(error.details.expectedDataType).toBe(DPT.Generic_U8)
        expect(error.details.data).toEqual(data)
    })

    it('stores CONNECTION_ERROR with knx error code', () => {
        const error = new KnxLinkException('CONNECTION_ERROR', 'Gateway busy', { knxErrorCode: KnxErrorCode.NO_MORE_CONNECTIONS })

        expect(error.details.knxErrorCode).toBe(KnxErrorCode.NO_MORE_CONNECTIONS)
    })

    it('stores PROTOCOL_ERROR with raw packet data', () => {
        const data = Buffer.from([0x00, 0x01, 0x02])
        const error = new KnxLinkException('PROTOCOL_ERROR', 'Invalid packet', { data })

        expect(error.details.data).toEqual(data)
    })

    it('stores NOT_A_CONNECTION_RESPONSE service id', () => {
        const error = new KnxLinkException('NOT_A_CONNECTION_RESPONSE', 'Wrong packet', { serviceId: KnxServiceId.SEARCH_RESPONSE })

        expect(error.details.serviceId).toBe(KnxServiceId.SEARCH_RESPONSE)
    })

    it('stores INVALID_VALUE as unknown', () => {
        const error = new KnxLinkException('INVALID_VALUE', 'Bad value', { value: { nested: true } })

        expect(error.details.value).toEqual({ nested: true })
    })

    it('stores ACK_TIMEOUT with channel', () => {
        const error = new KnxLinkException('ACK_TIMEOUT', 'Missing ACK', { channel: 3 })

        expect(error.code).toBe('ACK_TIMEOUT')
        expect(error.details.channel).toBe(3)
    })

    it('wraps socket errors as NETWORK_ERROR', () => {
        const error = knxNetworkError(new Error('ECONNREFUSED'))

        expect(error.code).toBe('NETWORK_ERROR')
        expect(error.message).toContain('ECONNREFUSED')
    })
})

describe('KnxReading type usage', () => {
    it('allows typed value payloads', () => {
        const reading = {
            target: '1/2/3',
            source: '1.1.1',
            text: '42',
            unit: '',
            value: 42
        }

        expect(reading.value).toBe(42)
    })
})
