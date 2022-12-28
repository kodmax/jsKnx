import { KnxConnectionType, KnxLayer } from '../enums'
import { cri } from './cri'

describe('CRI', () => {
    it('cri', () => {
        expect(cri(KnxConnectionType.DEVICE_MGMT_CONNECTION, KnxLayer.RAW_LAYER)).toEqual(Buffer.from([0x4, 0x3, 0x4, 0x0]))
    })
})
