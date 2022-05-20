import EventEmitter from "events"
import { KnxConnection } from "../connection"
import { DPT } from "../enums"
import { KnxCemiFrame } from "../message"
import { IDPT, KnxEventType } from "../types"

export abstract class DataPointAbstract<T> implements IDPT {
    public abstract readonly unit: string
    public abstract readonly type: DPT

    protected abstract write(value: T): Promise<void>
    protected abstract decode(data: Buffer): T

    protected async send(data: Buffer): Promise<void> {
        console.log('write', data)
    }

    public constructor(protected connection: KnxConnection, protected readonly address: string, protected readonly events: EventEmitter) {

    }
}