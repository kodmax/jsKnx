import { TunnelingRequest } from './tunneling'

describe('Tunneling', () => {
    it('sequence must start from 0', () => {
        expect(TunnelingRequest.compose(65).readUint8(2)).toEqual(0)
    })

    it('sequence must start from 0', () => {
        for (let seq = 1; seq <= 255; seq++) {
            expect(TunnelingRequest.compose(65).readUint8(2)).toEqual(seq)
        }
    })

    it('sequence must be modulo 256', () => {
        expect(TunnelingRequest.compose(65).readUint8(2)).toEqual(0)
    })

    it('each channel has different seq', () => {
        for (let seq = 0; seq <= 10; seq++) {
            expect(TunnelingRequest.compose(96).readUint8(2)).toEqual(seq)
        }
    })

    it('header', () => {
        expect(TunnelingRequest.compose(100)).toEqual(Buffer.from([0x4, 0x64, 0x00, 0x00]))
    })
})
