import { KnxCemiFrame } from '@repo/knx-common'
import { KnxDatapointLink, RequiredKnxLinkOptions } from '@repo/knx-common'

export function createF32<T>(DataType: new (address: string, link: KnxDatapointLink<KnxCemiFrame>, options: RequiredKnxLinkOptions) => T): T {
    const link = { sendCemiFrame: jest.fn().mockResolvedValue(undefined) } as unknown as KnxDatapointLink<KnxCemiFrame>
    const options = { readTimeout: 1000 } as RequiredKnxLinkOptions

    return new DataType('1/2/3', link, options)
}
