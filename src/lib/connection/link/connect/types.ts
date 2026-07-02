import { KnxConnectionType, KnxLayer } from '../../../enums'
import type { InternalLinkInfo } from '../LinkInfo'
import type { KnxLinkOptions } from '../LinkOptions'
import type { Socket } from 'dgram'

export type Connect = (
    options: KnxLinkOptions,
    gateway: Socket,
    tunnel: Socket,
    connectionType: KnxConnectionType,
    layer: KnxLayer
) => Promise<InternalLinkInfo>

export type { KnxLinkOptions } from '../LinkOptions'
export type { InternalLinkInfo, LinkInfo } from '../LinkInfo'
