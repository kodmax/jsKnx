import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'
import type { InternalLinkInfo } from '../../types'
import type { RequiredKnxLinkOptions } from '@repo/knx-common'
import type { Socket } from 'dgram'

export type Connect = (
    options: RequiredKnxLinkOptions,
    gateway: Socket,
    tunnel: Socket,
    connectionType: KnxConnectionType,
    layer: KnxLayer
) => Promise<InternalLinkInfo>
