import { APCI, KnxCemiCode } from '../../../../../../enums'
import { KnxLinkException } from '../../../../../../types'
import { KnxCemiFrame } from './cemi-frame'

describe('cEMI frame', () => {
    it('compose GroupValueWrite', () => {
        const frame = KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Request, '1.2.3', '4/5/6', Buffer.from([0x3f, 1, 2, 3, 4]))
        expect(frame).toEqual(Buffer.from([0x11, 0x00, 0xbc, 0xe0, 0x12, 0x03, 0x25, 0x06, 0x05, 0x00, 0xbf, 0x01, 0x02, 0x03, 0x04]))
    })

    it('compose GroupValueWrite', () => {
        const frame = KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Request, '1.2.3', '4/5/6', Buffer.from([1, 1, 2, 3, 4]))
        expect(frame).toEqual(Buffer.from([0x11, 0x00, 0xbc, 0xe0, 0x12, 0x03, 0x25, 0x06, 0x05, 0x00, 0x81, 0x01, 0x02, 0x03, 0x04]))
    })

    it('compose GroupValueRead', () => {
        const frame = KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Request, '1.2.3', '4/5/6')
        expect(frame).toEqual(Buffer.from([0x11, 0x00, 0xbc, 0xe0, 0x12, 0x03, 0x025, 0x06, 0x01, 0x00, 0x0]))
    })

    it('decode throws PROTOCOL_ERROR for invalid frame', () => {
        expect(() => KnxCemiFrame.decode(Buffer.from([0x00]))).toThrow(KnxLinkException)
        try {
            KnxCemiFrame.decode(Buffer.from([0x00]))
        } catch (e) {
            expect((e as KnxLinkException).code).toBe('PROTOCOL_ERROR')
        }
    })

    it('decode parses source, target and value from indication frame', () => {
        const raw = KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.2.3', '4/5/6', Buffer.from([0x00, 0x2a]))
        const frame = KnxCemiFrame.decode(raw)

        expect(frame.source).toBe('1.2.3')
        expect(frame.target).toBe('4/5/6')
        expect(frame.value.readUint8(1)).toBe(0x2a)
    })

    it('getService returns GROUP_VALUE_WRITE for write frame', () => {
        const raw = KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Indication, '1.0.0', '1/2/3', Buffer.from([0x00, 0x01]))
        const frame = KnxCemiFrame.decode(raw)

        expect(frame.getService()).toBe(APCI.APCI_GROUP_VALUE_WRITE)
    })

    it('getService returns GROUP_VALUE_READ for read frame', () => {
        const raw = KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Indication, '1.0.0', '1/2/3')
        const frame = KnxCemiFrame.decode(raw)

        expect(frame.getService()).toBe(APCI.APCI_GROUP_VALUE_READ)
    })

    it('controlByte and dlrByte expose standard constants', () => {
        expect(KnxCemiFrame.controlByte()).toBe(0xbc)
        expect(KnxCemiFrame.dlrByte()).toBe(0xe0)
    })

    it('compose builds generic frame with custom payload', () => {
        const frame = KnxCemiFrame.compose(KnxCemiCode.L_Data_Request, '1.1.1', '2/3/4', Buffer.from([0x01, 0x02]))

        expect(frame.readUint8(0)).toBe(KnxCemiCode.L_Data_Request)
        expect(frame.readUint8(8)).toBe(2)
        expect(frame.slice(10)).toEqual(Buffer.from([0x01, 0x02]))
    })
})
