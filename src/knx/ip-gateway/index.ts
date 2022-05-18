import { IKnxGateway, KnxEventType, KnxMessageCallback } from "../types";
import { createSocket, Socket } from "dgram";

export class IPGateway implements IKnxGateway {
    private readonly bus = createSocket({ type: 'udp4' })

    public constructor(private readonly socket: Socket) {
        console.log('Gateway initialization')
        this.bus.on('error', err => {
            console.log('bus error', err)
        })
        
        socket.on('connect', () => {
            console.log('tunnel connect')
        })
        
        this.bus.on('listening', () => {
            console.log(`server listening ${this.bus.address().address}:${this.bus.address().port}`);
        })

        this.bus.bind(3671, () => {
             socket.addMembership('224.0.23.12')
        })

        socket.on('error', err => {
            console.log('socket error', err)
        })
        
        socket.on('message', (msg, rinfo) => {
            console.log('knx message', msg)
        })

        this.bus.on('message', (msg, rinfo) => {
            console.log('bus message', msg)
        })
    }

    public async send(message: Buffer): Promise<void> {

    }

    public removeEventListener(eventType: KnxEventType, cb: KnxMessageCallback): void {

    }

    public addEventListener(eventType: KnxEventType, cb: KnxMessageCallback): void {

    }
}