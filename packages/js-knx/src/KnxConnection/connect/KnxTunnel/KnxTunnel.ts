import { Socket } from 'dgram'
import { OnCemiFrame } from '../types'
import { KnxTunnelOptions, PendingMessage } from './types'
import { sequence } from './sequence'
import { KnxCemiFrame, KnxIpMessage, TunnelingFrame } from './message'
import { KnxCemiCode, KnxServiceId } from '@repo/knx-enums'
import { KnxLinkException } from '@repo/knx-common'

export class KnxTunnel {
    private readonly nextSeq = sequence(255)
    private readonly acknowledge: Map<number, { timeoutId: ReturnType<typeof setTimeout>; ack: () => void }> = new Map()
    private readonly pendingMessages: PendingMessage[] = []

    private concurrentMessagesCounter = 0
    private isClosed = false

    constructor(
        private readonly socket: Socket,
        private readonly channel: number,
        onCemiFrame: OnCemiFrame,
        private readonly options: KnxTunnelOptions
    ) {
        this.socket.on('message', msg => {
            let ipMessage: KnxIpMessage

            try {
                ipMessage = KnxIpMessage.decode(msg)
            } catch {
                return
            }

            if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST) {
                const tunneling = new TunnelingFrame(ipMessage.getBody())
                this.socket.send(tunneling.ack().getBuffer())

                if ([KnxCemiCode.L_Data_Indication].includes(tunneling.getCemiCode())) {
                    try {
                        onCemiFrame(KnxCemiFrame.decode(tunneling.getBody()))
                    } catch {
                        // ignore corrupt cEMI frames
                    }
                }
            } else if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_RESPONSE) {
                const tunneling = new TunnelingFrame(ipMessage.getBody())
                const seq = tunneling.getSequenceNumber()
                --this.concurrentMessagesCounter

                if (this.acknowledge.has(seq)) {
                    const pendingMessage = this.acknowledge.get(seq)!
                    clearTimeout(pendingMessage.timeoutId)
                    this.acknowledge.delete(seq)
                    pendingMessage.ack()
                }
            }
        })

        const sendInterval = setInterval(() => {
            if (this.concurrentMessagesCounter < this.options.maxConcurrentMessages) {
                const message = this.pendingMessages.shift()

                if (message) {
                    this.send(message)
                }
            }
        }, 1000 / this.options.maxTelegramsPerSecond)

        this.socket.on('close', () => {
            clearInterval(sendInterval)
            this.isClosed = true
        })
    }

    private send(message: PendingMessage): void {
        this.socket.send(message.packet.getBuffer())
        ++this.concurrentMessagesCounter

        this.acknowledge.set(message.packet.getSequence(), {
            ack: message.resolve,
            timeoutId: setTimeout(() => {
                this.socket.send(message.packet.getBuffer()) // retry one time

                this.acknowledge.set(message.packet.getSequence(), {
                    ack: message.resolve,
                    timeoutId: setTimeout(() => {
                        this.pendingMessages.splice(0, this.pendingMessages.length)
                        try {
                            if (!this.isClosed) {
                                this.isClosed = true
                                this.socket.close()
                            }
                        } catch {
                            // ignore
                        }
                        message.reject(new KnxLinkException('ACK_TIMEOUT', `Gateway did not acknowledge tunnel telegram`, { channel: this.channel }))
                    }, 1000)
                })
            }, 1000)
        })
    }

    async sendCemiFrame(cemiFrame: Buffer): Promise<void> {
        if (this.isClosed) {
            throw new KnxLinkException('NO_CONNECTION', 'No connection', {})
        } else {
            return new Promise((resolve, reject) => {
                this.pendingMessages.push({
                    packet: KnxIpMessage.compose(KnxServiceId.TUNNEL_REQUEST, [TunnelingFrame.compose(this.channel, this.nextSeq()), cemiFrame]),
                    resolve,
                    reject
                })
            })
        }
    }
}
