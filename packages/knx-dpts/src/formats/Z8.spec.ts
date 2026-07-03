import { B8 } from './B8'
import { KnxStandardStatus } from './Z8'

function statusToBits(status: KnxStandardStatus): number[] {
    return [+status.OutOfService, +status.Fault, +status.Overridden, +status.InAlarm, +status.AlarmUnAck, 0, 0, 0]
}

function bitsToStatus(bits: number[]): KnxStandardStatus {
    return {
        OutOfService: !!bits[0],
        Fault: !!bits[1],
        Overridden: !!bits[2],
        InAlarm: !!bits[3],
        AlarmUnAck: !!bits[4]
    }
}

describe('Z8', () => {
    it('write uses MSB-first bit order with b0 as OutOfService', () => {
        const status: KnxStandardStatus = {
            OutOfService: true,
            Fault: false,
            Overridden: false,
            InAlarm: false,
            AlarmUnAck: false
        }
        const buf = B8.toBuffer(statusToBits(status), Buffer.alloc(2))
        expect(buf.readUint8(1)).toBe(0b10000000)
        expect(bitsToStatus(B8.fromBuffer(buf))).toEqual(status)
    })

    it('round-trips all status flags', () => {
        const status: KnxStandardStatus = {
            OutOfService: true,
            Fault: true,
            Overridden: true,
            InAlarm: true,
            AlarmUnAck: true
        }
        const buf = B8.toBuffer(statusToBits(status), Buffer.alloc(2))
        expect(bitsToStatus(B8.fromBuffer(buf))).toEqual(status)
        expect(buf.readUint8(1)).toBe(0b11111000)
    })
})
