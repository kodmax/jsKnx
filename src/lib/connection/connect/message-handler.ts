import { KnxCemiFrame, KnxIpMessage, TunnelingRequest } from '../../message'
import { KnxLinkException } from '../../types'
import { KnxCemiCode, KnxServiceId } from '../../enums'
import { sequence } from './sequence'
import { Socket } from 'dgram'

export type SendCemiFrame = (cemiFrame: Buffer) => Promise<void>
export type OnCemiFrame = (cemiFrame: KnxCemiFrame) => void

type MessageHandler = (
    tunnel: Socket,
    channel: number,
    maxConcurrentMessages: number,
    maxTelegramsPerSecond: number,
    onCemiFrame: OnCemiFrame
) => SendCemiFrame

type PendingMessage = {
    packet: KnxIpMessage
    resolve: () => void
    reject: () => void
}

const messageHandler: MessageHandler = (tunnel, channel, maxConcurrentMessages, maxTelegramsPerSecond, onCemiFrame) => {
    const acknowledge: Map<number, { timeoutId: ReturnType<typeof setTimeout>, ack: () => void }> = new Map()
    const nextSeq = sequence(255)
    let isClosed = false

    const pendingMessages: PendingMessage[] = []
    let concurrectMessagesCounter = 0

    tunnel.on('message', msg => {
        const ipMessage = KnxIpMessage.decode(msg)

        if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_REQUEST) {
            const tunneling = new TunnelingRequest(ipMessage.getBody())
            tunnel.send(tunneling.ack().getBuffer())

            if ([KnxCemiCode.L_Data_Indication].includes(tunneling.getCemiCode())) {
                onCemiFrame(new KnxCemiFrame(tunneling.getBody()))
            }

        } else if (ipMessage.getServiceId() === KnxServiceId.TUNNEL_RESPONSE) {
            const tunneling = new TunnelingRequest(ipMessage.getBody())
            const seq = tunneling.getSequenceNumber()
            --concurrectMessagesCounter

            if (acknowledge.has(seq)) {
                const pendingMessage = acknowledge.get(seq)!
                clearTimeout(pendingMessage.timeoutId)
                acknowledge.delete(seq)
                pendingMessage.ack()
            }
        }
    })

    const send = (message: PendingMessage): void => {
        tunnel.send(message.packet.getBuffer())
        ++concurrectMessagesCounter

        acknowledge.set(message.packet.getSequence(), {
            ack: message.resolve,
            timeoutId: setTimeout(() => {
                tunnel.send(message.packet.getBuffer()) // retry one time

                acknowledge.set(message.packet.getSequence(), {
                    ack: message.resolve,
                    timeoutId: setTimeout(() => {
                        pendingMessages.splice(0, pendingMessages.length)
                        try {
                            if (!isClosed) {
                                isClosed = true
                                tunnel.close()
                            }

                        } catch (e) {
                            // ignore
                        }
                        message.reject()
                    }, 1000)
                })
            }, 1000)
        })
    }

    const sendInterval = setInterval(() => {
        if (concurrectMessagesCounter < maxConcurrentMessages) {
            const message = pendingMessages.shift()

            if (message) {
                send(message)
            }
        }
    }, 1000 / maxTelegramsPerSecond)

    tunnel.on('close', () => {
        clearInterval(sendInterval)
        isClosed = true
    })

    return async (cemiFrame: Buffer) => {
        if (isClosed) {
            throw new KnxLinkException('NO_CONNECTION', 'No connection', {})

        } else {
            return new Promise((resolve, reject) => {
                pendingMessages.push({
                    packet: KnxIpMessage.compose(
                        KnxServiceId.TUNNEL_REQUEST, [
                            TunnelingRequest.compose(channel, nextSeq()),
                            cemiFrame
                        ]
                    ),
                    resolve,
                    reject
                })
            })
        }
    }
}

export { messageHandler }
