import { KnxConnectionType, KnxLayer } from '../../../../enums'
import type { InternalLinkInfo, RequiredKnxLinkOptions } from '../../types'
import type { Socket } from 'dgram'

export type Connect = (
    options: RequiredKnxLinkOptions,
    gateway: Socket,
    tunnel: Socket,
    connectionType: KnxConnectionType,
    layer: KnxLayer
) => Promise<InternalLinkInfo>

export type {
    KnxLinkOptions,
    RequiredKnxLinkOptions,
    InternalLinkInfo,
    LinkInfo,
    KnxDisconnectedReason,
    KnxConnectingEvent,
    KnxReconnectingEvent,
    KnxDisconnectedEvent
} from '../../types'
export type { OnCemiFrame } from './KnxTunnel/types'
