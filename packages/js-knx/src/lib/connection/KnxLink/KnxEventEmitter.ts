import EventEmitter from 'events'
import { KnxCemiFrame } from '@repo/knx-message'
import type { KnxEventMap as KnxEventMapBase } from '@repo/knx-common'

export type KnxEventMap = KnxEventMapBase<KnxCemiFrame>

export type KnxEventName = keyof KnxEventMap

export type KnxEventListener<K extends KnxEventName> = (arg: KnxEventMap[K]) => void

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
