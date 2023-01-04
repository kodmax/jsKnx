import { KnxCemiFrame, KnxIpMessage, TunnelingRequest } from '../message'
import { KnxCemiCode, KnxServiceId } from '../enums'
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

const messageHandler: MessageHandler = (tunnel, channel, maxConcurrentMessages, maxTelegramsPerSecond, onCemiFrame) => {
    const ackTimeouts: Map<number, ReturnType<typeof setTimeout>> = new Map()
    const nextSeq = sequence(255)

    const msPause = 1000 / maxTelegramsPerSecond * maxConcurrentMessages
    let pauseId: ReturnType<typeof setTimeout> | undefined

    const pendingMessages: Array<KnxIpMessage> = []
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

            if (ackTimeouts.has(seq)) {
                clearTimeout(ackTimeouts.get(seq))
                ackTimeouts.delete(seq)
            }

            if (concurrectMessagesCounter === 0 && pendingMessages.length > 0 && !pauseId) {
                pauseId = setTimeout(() => {
                    for (const message of pendingMessages.splice(0, maxConcurrentMessages)) {
                        send(message)
                    }

                    pauseId = void 0
                }, msPause)
            }
        }
    })

    const send = (message: KnxIpMessage): void => {
        ackTimeouts.set(message.getSequence(), setTimeout(() => {
            tunnel.send(message.getBuffer())
        }, 1000))

        tunnel.send(message.getBuffer())
        ++concurrectMessagesCounter
    }

    return async (cemiFrame: Buffer) => {
        const message = KnxIpMessage.compose(
            KnxServiceId.TUNNEL_REQUEST, [
                TunnelingRequest.compose(channel, nextSeq()),
                cemiFrame
            ]
        )

        if (concurrectMessagesCounter < maxConcurrentMessages && pendingMessages.length === 0) {
            send(message)

        } else {
            pendingMessages.push(message)
        }
    }
}

export { messageHandler }
