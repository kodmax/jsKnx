import { KnxServiceId } from '../enums'
import { KnxLinkException } from '../types'
import { KnxIpMessage } from './ip-message'

describe('KNX IP Message', () => {
    it('header', () => {
        const message = KnxIpMessage.compose(KnxServiceId.DESCRIPTION_REQUEST, [Buffer.from([1]), Buffer.from([2]), Buffer.from([3])])
        expect(message.getBuffer()).toEqual(Buffer.from([0x06, 0x10, 0x02, 0x03, 0x00, 0x09, 0x01, 0x02, 0x3]))
    })

    it('decode throws PROTOCOL_ERROR for invalid header', () => {
        expect(() => KnxIpMessage.decode(Buffer.from([0x00, 0x00]))).toThrow(KnxLinkException)
        try {
            KnxIpMessage.decode(Buffer.from([0x00, 0x00]))
        } catch (e) {
            expect((e as KnxLinkException).code).toBe('PROTOCOL_ERROR')
        }
    })
})
