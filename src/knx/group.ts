import { EventEmitter } from "stream";
import { KnxCemiFrame } from "./message/cemi-frame";
import { IDPT } from "./types";

export class KnxGroup<T extends IDPT> {
    public constructor(private readonly address: string, private readonly events: EventEmitter) {
        events.on('tunnel-request', message => {
            const cemiFrame = message as KnxCemiFrame
            cemiFrame.dump("Group Bus Message")
        })
    }
}