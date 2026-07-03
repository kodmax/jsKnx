import type { DataPointAbstract } from '@repo/knx-dpts'
import type { KnxLink } from './KnxLink'

export type {
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

export type DatapointConstructor<T extends DataPointAbstract<unknown>> = import('@repo/knx-common').DatapointConstructor<T, KnxLink>

export type KnxGroupSchema<T extends DataPointAbstract<unknown>> = import('@repo/knx-common').KnxGroupSchema<T, KnxLink>
