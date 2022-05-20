import { EventEmitter } from "events";

export class Vent<T> extends EventEmitter {
    public async trigger<T>(eventName: string, data: T): Promise<void> {
        super.emit(eventName, data)
    }

    public removeEventListener<T>(eventName: string, listener: (data: T) => void): void {
        super.off(eventName, listener)
    }

    public addEventListener<T>(eventName: string, listener: (data: T) => void): void {
        super.on(eventName, listener)
    }
}