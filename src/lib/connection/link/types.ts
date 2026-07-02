import type { IDPT } from '../../dpts/formats'
import type { KnxLink } from './KnxLink'
import type { KnxLinkOptions } from './LinkOptions'

export type DatapointConstructor<T extends IDPT> = new (address: string, link: KnxLink, options: Required<KnxLinkOptions>) => T

export type KnxGroupSchema<T extends IDPT> = {
    DataType: DatapointConstructor<T>
    address: string
}
