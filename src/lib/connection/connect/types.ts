import { KnxConnectionType, KnxLayer } from '../../enums'
import type { InternalLinkInfo } from '../link/LinkInfo'
import type { KnxLinkOptions } from '../link/LinkOptions'
import type { Socket } from 'dgram'

export type Connect = (
    options: KnxLinkOptions,
    gateway: Socket,
    tunnel: Socket,
    connectionType: KnxConnectionType,
    layer: KnxLayer
) => Promise<InternalLinkInfo>

export type { KnxLinkOptions } from '../link/LinkOptions'
export type { InternalLinkInfo, LinkInfo } from '../link/LinkInfo'
