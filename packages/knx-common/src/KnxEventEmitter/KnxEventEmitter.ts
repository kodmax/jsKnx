import EventEmitter from 'events'
import type { KnxLinkException } from '../KnxLinkException'
import type { LinkInfo } from '../KnxLink'
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

export type KnxEventName<TCemiFrame = unknown> = keyof KnxEventMap<TCemiFrame>

export type KnxEventListener<K extends KnxEventName<TCemiFrame>, TCemiFrame = unknown> = (arg: KnxEventMap<TCemiFrame>[K]) => void

export class KnxEventEmitter<TCemiFrame = unknown> {
    private readonly emitter = new EventEmitter()

    on<K extends KnxEventName<TCemiFrame>>(eventName: K, listener: KnxEventListener<K, TCemiFrame>): this {
        this.emitter.on(eventName, listener)

        return this
    }

    off<K extends KnxEventName<TCemiFrame>>(eventName: K, listener: KnxEventListener<K, TCemiFrame>): this {
        this.emitter.off(eventName, listener)

        return this
    }

    once<K extends KnxEventName<TCemiFrame>>(eventName: K, listener: KnxEventListener<K, TCemiFrame>): this {
        this.emitter.once(eventName, listener)

        return this
    }

    listenerCount<K extends KnxEventName<TCemiFrame>>(eventName: K): number {
        return this.emitter.listenerCount(eventName)
    }

    emit<K extends KnxEventName<TCemiFrame>>(eventName: K, arg: KnxEventMap<TCemiFrame>[K]): boolean {
        return this.emitter.emit(eventName, arg)
    }
}
