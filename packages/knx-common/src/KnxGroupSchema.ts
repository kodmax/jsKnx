import type { RequiredKnxLinkOptions } from './KnxLinkOptions'

export type DatapointConstructor<T, TLink = unknown> = new (address: string, link: TLink, options: RequiredKnxLinkOptions) => T

export type KnxGroupSchema<T, TLink = unknown> = {
    DataType: DatapointConstructor<T, TLink>
    address: string
}
