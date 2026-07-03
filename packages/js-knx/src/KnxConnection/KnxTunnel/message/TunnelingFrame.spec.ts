import { KnxCemiCode, KnxServiceId } from '@repo/knx-enums'
import { KnxLinkException } from '@repo/knx-common'
import { TunnelingFrame } from './TunnelingFrame'
import { KnxIpMessage } from '@repo/knx-common'

describe('TunnelingFrame', () => {
    it('sequence must match', () => {
        expect(TunnelingFrame.compose(65, 241).readUint8(2)).toEqual(241)
    })

    it('sequence must start from 0', () => {
        for (let seq = 0; seq <= 255; seq++) {
            expect(TunnelingFrame.compose(65, seq).readUint8(2)).toEqual(seq)
        }
    })

    it('header', () => {
        expect(TunnelingFrame.compose(100, 0x43)).toEqual(Buffer.from([0x4, 0x64, 0x43, 0x00]))
    })

    it('getChannel returns tunnel channel', () => {
        const request = new TunnelingFrame(TunnelingFrame.compose(12, 1))
        expect(request.getChannel()).toBe(12)
    })

    it('getSequenceNumber returns sequence byte', () => {
        const request = new TunnelingFrame(TunnelingFrame.compose(1, 200))
        expect(request.getSequenceNumber()).toBe(200)
    })

    it('getBody returns trailing cEMI payload', () => {
        const cemi = Buffer.from([0x29, 0x00, 0xbc])
        const frame = Buffer.concat([TunnelingFrame.compose(3, 4), cemi])
        const request = new TunnelingFrame(frame)

        expect(request.getBody()).toEqual(cemi)
    })

    it('getCemiCode reads first byte of body', () => {
        const frame = Buffer.concat([TunnelingFrame.compose(1, 1), Buffer.from([KnxCemiCode.L_Data_Indication])])
        const request = new TunnelingFrame(frame)

        expect(request.getCemiCode()).toBe(KnxCemiCode.L_Data_Indication)
    })

    it('ack composes TUNNEL_RESPONSE with same channel and sequence', () => {
        const request = new TunnelingFrame(TunnelingFrame.compose(8, 15))
        const ack = request.ack()

        expect(ack.getServiceId()).toBe(KnxServiceId.TUNNEL_RESPONSE)
        expect(ack.getBody()).toEqual(TunnelingFrame.compose(8, 15))
    })

    it('throws PROTOCOL_ERROR for invalid tunneling header', () => {
        expect(() => new TunnelingFrame(Buffer.from([0x00, 0x01, 0x02, 0x03]))).toThrow(KnxLinkException)
        try {
            new TunnelingFrame(Buffer.from([0x00, 0x01, 0x02, 0x03]))
        } catch (e) {
            expect((e as KnxLinkException).code).toBe('PROTOCOL_ERROR')
        }
    })

    it('throws PROTOCOL_ERROR when structure length byte is not zero', () => {
        expect(() => new TunnelingFrame(Buffer.from([0x04, 0x01, 0x02, 0x01]))).toThrow(KnxLinkException)
        try {
            new TunnelingFrame(Buffer.from([0x04, 0x01, 0x02, 0x01]))
        } catch (e) {
            expect((e as KnxLinkException).code).toBe('PROTOCOL_ERROR')
        }
    })
})

describe('Tunneling over KnxIpMessage', () => {
    it('embeds tunnel header before cEMI frame in tunnel request packet', () => {
        const cemi = Buffer.from([0x11, 0x00])
        const packet = KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingFrame.compose(2, 9), cemi])

        expect(packet.getBody().slice(0, 4)).toEqual(TunnelingFrame.compose(2, 9))
        expect(packet.getBody().slice(4)).toEqual(cemi)
    })
})
