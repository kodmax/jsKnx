import { KnxCemiFrame } from '@repo/knx-message'
import { KnxDatapointLink, RequiredKnxLinkOptions } from '@repo/knx-common'
import { DPT_ActiveEnergy } from './DPT_ActiveEnergy'

function createV32<T>(
    DataType: new (address: string, link: KnxDatapointLink<KnxCemiFrame>, options: RequiredKnxLinkOptions) => T
): T {
    const link = { sendCemiFrame: jest.fn().mockResolvedValue(undefined) } as unknown as KnxDatapointLink<KnxCemiFrame>
    const options = { readTimeout: 1000 } as RequiredKnxLinkOptions

    return new DataType('4/1/0', link, options)
}

describe('DPT_ActiveEnergy', () => {
    it('toString includes Wh unit', () => {
        const dp = createV32(DPT_ActiveEnergy)
        expect(dp.toString(12345)).toBe('12345 Wh')
    })
})
