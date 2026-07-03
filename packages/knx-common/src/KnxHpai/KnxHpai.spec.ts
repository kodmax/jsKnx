import { hpai } from './KnxHpai'

describe('HPAI', () => {
    it('hpai', () => {
        expect(hpai({ address: '192.168.1.2', port: 3677, family: 'udp' })).toEqual(Buffer.from([0x08, 0x01, 0xc0, 0xa8, 0x01, 0x02, 0x0e, 0x5d]))
    })

    it('encodes standard KNX port 3671', () => {
        expect(hpai({ address: '10.0.0.1', port: 3671, family: 'IPv4' })).toEqual(Buffer.from([0x08, 0x01, 0x0a, 0x00, 0x00, 0x01, 0x0e, 0x57]))
    })

    it('splits port into high and low bytes', () => {
        const encoded = hpai({ address: '127.0.0.1', port: 0x0102, family: 'IPv4' })
        expect(encoded.readUint8(6)).toBe(0x01)
        expect(encoded.readUint8(7)).toBe(0x02)
    })
})
