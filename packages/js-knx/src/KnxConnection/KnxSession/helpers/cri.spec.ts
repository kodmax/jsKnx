import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'
import { cri } from './cri'

describe('CRI', () => {
    it('cri', () => {
        expect(cri(KnxConnectionType.DEVICE_MGMT_CONNECTION, KnxLayer.RAW_LAYER)).toEqual(Buffer.from([0x4, 0x3, 0x4, 0x0]))
    })

    it('encodes tunnel connection on link layer', () => {
        expect(cri(KnxConnectionType.TUNNEL_CONNECTION, KnxLayer.LINK_LAYER)).toEqual(Buffer.from([0x04, 0x04, 0x02, 0x00]))
    })
})
