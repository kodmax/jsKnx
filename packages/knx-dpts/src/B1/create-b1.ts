import { KnxCemiFrame } from '@repo/knx-message'
import { KnxDatapointLink, RequiredKnxLinkOptions } from '@repo/knx-common'

export function createB1<T>(DataType: new (address: string, link: KnxDatapointLink<KnxCemiFrame>, options: RequiredKnxLinkOptions) => T, address = '2/0/4'): T {
    const link = { sendCemiFrame: jest.fn().mockResolvedValue(undefined) } as unknown as KnxDatapointLink<KnxCemiFrame>
    const options = { readTimeout: 1000 } as RequiredKnxLinkOptions

    return new DataType(address, link, options)
}
