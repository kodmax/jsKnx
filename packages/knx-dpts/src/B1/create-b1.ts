import { KnxLink, RequiredKnxLinkOptions } from '@js-knx-internal/connection'

export function createB1<T>(DataType: new (address: string, link: KnxLink, options: RequiredKnxLinkOptions) => T, address = '2/0/4'): T {
    const link = { sendCemiFrame: jest.fn().mockResolvedValue(undefined) } as unknown as KnxLink
    const options = { readTimeout: 1000 } as RequiredKnxLinkOptions

    return new DataType(address, link, options)
}
