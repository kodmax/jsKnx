import { sequence } from '../connection/sequence'
import { TunnelingRequest } from './tunneling'

describe('Tunneling', () => {
    const nextSeq = sequence(255)

    it('sequence must match', () => {
        expect(TunnelingRequest.compose(65, 241).readUint8(2)).toEqual(241)
    })

    it('sequence must start from 0', () => {
        for (let seq = 0; seq <= 255; seq++) {
            expect(TunnelingRequest.compose(65, nextSeq()).readUint8(2)).toEqual(seq)
        }
    })

    it('header', () => {
        expect(TunnelingRequest.compose(100, 0x43)).toEqual(Buffer.from([0x4, 0x64, 0x43, 0x00]))
    })
})
