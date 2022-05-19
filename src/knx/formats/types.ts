import { KnxEventType } from "../types"
import { Socket } from "dgram"
import { DPT } from "../enums"

export interface DataPoint<T> {
    removeEventListener(eventType: KnxEventType, cb: (value: T) => Promise<void>): void
    addEventListener(eventType: KnxEventType, cb: (value: T) => Promise<void>): void
    write(value: T): Promise<void>
    ping(): Promise<void>
    read(): Promise<T>
}

type EventCallbacks<T> = Record<KnxEventType, Set<EventCallback<T>>>
export type EventCallback<T> = (value: T) => Promise<void>

export abstract class DataPointAbstract<T> {
    public static readonly unit: string
    public static readonly type: DPT

    public constructor(protected readonly addresses: string[], protected readonly bus: Socket) {
        if (addresses.length === 0) {
            throw new Error("At least one DataPoint address must be specified")
        }
    }

    private readonly eventCallbacks: EventCallbacks<T> = {
        command: new Set<EventCallback<T>>(),
        write: new Set<EventCallback<T>>(),
        state: new Set<EventCallback<T>>()
    }

    public removeEventListener(eventType: KnxEventType, cb: EventCallback<T>): void {
        this.eventCallbacks [eventType].delete(cb)
    }    

    public addEventListener(eventType: KnxEventType, cb: EventCallback<T>): EventCallback<T> {
        this.eventCallbacks [eventType].add(cb)

        return cb
    }    

    protected async triggerEvent(eventType: KnxEventType, value: T) {
        for (const cb of this.eventCallbacks[eventType]) {
            await cb(value)
        }
    }
}