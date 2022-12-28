import { KnxServiceId } from '../enums'
import { KnxIpMessage } from './ip-message'

describe('KNX IP Message', () => {
    it('header', () => {
        expect(KnxIpMessage.compose(KnxServiceId.DESCRIPTION_REQUEST, [Buffer.from([1]), Buffer.from([2]), Buffer.from([3])]).getBuffer()).toEqual(Buffer.from([0x06, 0x10, 0x02, 0x03, 0x00, 0x09, 0x01, 0x02, 0x3]))
    })
})
