import { hpai } from './hpai'

describe('HPAI', () => {
    it('hpai', () => {
        expect(hpai({ address: '192.168.1.2', port: 3677, family: 'udp' })).toEqual(Buffer.from([0x08, 0x01, 0xc0, 0xa8, 0x01, 0x02, 0x0e, 0x5d]))
    })
})
