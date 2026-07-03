import { KnxServiceId } from '@repo/knx-enums'
import { KnxLinkException } from '../KnxLinkException'
import { KnxIpMessage } from './KnxIpMessage'

describe('KnxIpMessage', () => {
    it('header', () => {
        const message = KnxIpMessage.compose(KnxServiceId.DESCRIPTION_REQUEST, [Buffer.from([1]), Buffer.from([2]), Buffer.from([3])])
        expect(message.getBuffer()).toEqual(Buffer.from([0x06, 0x10, 0x02, 0x03, 0x00, 0x09, 0x01, 0x02, 0x3]))
    })

    it('decode returns message for valid packet', () => {
        const composed = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [Buffer.from([0x04, 0x01, 0x02, 0x00])])
        const decoded = KnxIpMessage.decode(composed.getBuffer())

        expect(decoded.getServiceId()).toBe(KnxServiceId.TUNNEL_REQUEST)
        expect(decoded.getBody()).toEqual(Buffer.from([0x04, 0x01, 0x02, 0x00]))
    })

    it('getSequence reads tunnel sequence byte', () => {
        const message = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [Buffer.from([0x04, 0x05, 0x07, 0x00])])

        expect(message.getSequence()).toBe(0x07)
    })

    it('getBuffer returns underlying buffer', () => {
        const message = KnxIpMessage.compose(KnxServiceId.SEARCH_REQUEST, [])
        expect(message.getBuffer()).toBeInstanceOf(Buffer)
        expect(message.getBuffer().readUInt16BE(0)).toBe(0x0610)
    })

    it('decode throws PROTOCOL_ERROR for invalid header', () => {
        expect(() => KnxIpMessage.decode(Buffer.from([0x00, 0x00]))).toThrow(KnxLinkException)
        try {
            KnxIpMessage.decode(Buffer.from([0x00, 0x00]))
        } catch (e) {
            expect((e as KnxLinkException).code).toBe('PROTOCOL_ERROR')
        }
    })

    it('decode throws PROTOCOL_ERROR when total length does not match buffer', () => {
        const message = KnxIpMessage.compose(KnxServiceId.SEARCH_REQUEST, [])
        const invalid = Buffer.from(message.getBuffer())
        invalid.writeUInt16BE(invalid.length + 1, 4)

        expect(() => KnxIpMessage.decode(invalid)).toThrow(KnxLinkException)
    })

    it('decode throws PROTOCOL_ERROR for wrong magic bytes', () => {
        const message = KnxIpMessage.compose(KnxServiceId.SEARCH_REQUEST, [])
        const invalid = Buffer.from(message.getBuffer())
        invalid.writeUInt16BE(0x0000, 0)

        expect(() => KnxIpMessage.decode(invalid)).toThrow(KnxLinkException)
    })
})
