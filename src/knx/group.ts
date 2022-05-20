import { KnxServiceId } from "./enums";
import { KnxIpMessage } from "./message";
import { IDPT } from "./types";
import { Vent } from "./vent";

export class KnxGroup<T extends IDPT> {
    public constructor(private readonly address: string, private readonly events: Vent<KnxIpMessage>, private readonly label?: string) {
        events.on('tunnel-request', ipMessage => {
            if (ipMessage.hasCemiFrame()) {
                ipMessage.getCemiFrame().dump("Group Bus Message")
            }
        })
    }
}