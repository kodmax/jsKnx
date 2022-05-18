import { IKnxGateway, KnxEventType, KnxMessageCallback } from "../types";
import { Socket } from "dgram";

export class IPGateway implements IKnxGateway {

    public constructor(private readonly socket: Socket) {

    }

    public async send(message: Buffer): Promise<void> {

    }

    public removeEventListener(eventType: KnxEventType, cb: KnxMessageCallback): void {

    }

    public addEventListener(eventType: KnxEventType, cb: KnxMessageCallback): void {

    }
}