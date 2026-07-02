import EventEmitter from 'events'
import { KnxCemiFrame } from '../../message'
import { KnxLinkException } from '../../types'
import type {
    KnxConnectingEvent,
    KnxDisconnectedEvent,
    KnxStartingSessionEvent,
    KnxNetworkConnectionEstablishedEvent,
    KnxReconnectingEvent,
    LinkInfo
} from './types'

export type KnxEventMap = {
    error: KnxLinkException
    'cemi-frame': KnxCemiFrame
    connecting: KnxConnectingEvent
    'network-connection-established': KnxNetworkConnectionEstablishedEvent
    'starting-session': KnxStartingSessionEvent
    connected: LinkInfo
    reconnecting: KnxReconnectingEvent
    disconnected: KnxDisconnectedEvent
}

export type KnxEventName = keyof KnxEventMap

type KnxEventListener<K extends KnxEventName> = (arg: KnxEventMap[K]) => void

export type { KnxEventListener }

export class KnxEventEmitter {
    private readonly emitter = new EventEmitter()

    on<K extends KnxEventName>(eventName: K, listener: KnxEventListener<K>): this {
        this.emitter.on(eventName, listener)

        return this
    }

    off<K extends KnxEventName>(eventName: K, listener: KnxEventListener<K>): this {
        this.emitter.off(eventName, listener)

        return this
    }

    once<K extends KnxEventName>(eventName: K, listener: KnxEventListener<K>): this {
        this.emitter.once(eventName, listener)

        return this
    }

    listenerCount<K extends KnxEventName>(eventName: K): number {
        return this.emitter.listenerCount(eventName)
    }

    emit<K extends KnxEventName>(eventName: K, arg: KnxEventMap[K]): boolean {
        return this.emitter.emit(eventName, arg)
    }
}
