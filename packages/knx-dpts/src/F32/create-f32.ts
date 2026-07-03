import { KnxLink, RequiredKnxLinkOptions } from '@js-knx-internal/connection'

export function createF32<T>(DataType: new (address: string, link: KnxLink, options: RequiredKnxLinkOptions) => T): T {
    const link = { sendCemiFrame: jest.fn().mockResolvedValue(undefined) } as unknown as KnxLink
    const options = { readTimeout: 1000 } as RequiredKnxLinkOptions

    return new DataType('3/1/1', link, options)
}
