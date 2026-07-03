import type { KnxLinkException } from './KnxLinkException'
import type { LinkInfo } from './LinkInfo'
import type {
    KnxConnectingEvent,
    KnxDisconnectedEvent,
    KnxNetworkConnectionEstablishedEvent,
    KnxReconnectingEvent,
    KnxStartingSessionEvent
} from './KnxConnectionEvents'

export type KnxEventMap<TCemiFrame = unknown> = {
    error: KnxLinkException
    'cemi-frame': TCemiFrame
    connecting: KnxConnectingEvent
    'network-connection-established': KnxNetworkConnectionEstablishedEvent
    'starting-session': KnxStartingSessionEvent
    connected: LinkInfo
    reconnecting: KnxReconnectingEvent
    disconnected: KnxDisconnectedEvent
}

export type KnxEventName = keyof KnxEventMap

export type KnxEventListener<K extends KnxEventName = KnxEventName> = (arg: KnxEventMap[K]) => void
