import { Socket } from 'dgram'
import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'
import type { IDPT } from '@repo/knx-dpts'
import type { KnxLinkException } from '@repo/knx-common'
import type { KnxLink } from './KnxLink'

export type {
    KnxLinkOptions,
    RequiredKnxLinkOptions,
    KnxLinkConstructorOptions,
    LinkInfo,
    KnxDisconnectedReason,
    KnxConnectingEvent,
    KnxNetworkConnectionEstablishedEvent,
    KnxStartingSessionEvent,
    KnxReconnectingEvent,
    KnxDisconnectedEvent
} from '@repo/knx-common'

export type OnError = (error: KnxLinkException) => void

export type InternalLinkInfo = {
    connectionType: KnxConnectionType
    individualAddress: string
    channel: number
    layer: KnxLayer

    gateway: Socket
    tunnel: Socket
    port: number
    ip: string
}

export type DatapointConstructor<T extends IDPT> = import('@repo/knx-common').DatapointConstructor<T, KnxLink>

export type KnxGroupSchema<T extends IDPT> = import('@repo/knx-common').KnxGroupSchema<T, KnxLink>
