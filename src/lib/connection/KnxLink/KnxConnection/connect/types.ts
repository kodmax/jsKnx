import { KnxConnectionType, KnxLayer } from '../../../../enums'
import type { InternalLinkInfo, KnxLinkOptions } from '../../types'
import type { OnCemiFrame } from './message-handler'
import type { Socket } from 'dgram'

export type Connect = (
    options: KnxLinkOptions,
    gateway: Socket,
    tunnel: Socket,
    connectionType: KnxConnectionType,
    layer: KnxLayer,
    onCemiFrame: OnCemiFrame
) => Promise<InternalLinkInfo>

export type { KnxLinkOptions, InternalLinkInfo, LinkInfo } from '../../types'
export type { OnCemiFrame } from './message-handler'
