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

const messageHandler: MessageHandler = (tunnel, channel, maxConcurrentMessages, maxTelegramsPerSecond, onCemiFrame) => {
    const ackTimeouts: Map<number, ReturnType<typeof setTimeout>> = new Map()
    const nextSeq = sequence(255)
    let isClosed = false

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
        }
    })

    const send = (message: KnxIpMessage): void => {
        ackTimeouts.set(message.getSequence(), setTimeout(() => {
            tunnel.send(message.getBuffer())

            ackTimeouts.set(message.getSequence(), setTimeout(() => {
                pendingMessages.splice(0, pendingMessages.length)
                tunnel.close()
            }, 1000))
        }, 1000))

        tunnel.send(message.getBuffer())
        ++concurrectMessagesCounter
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
            pendingMessages.push(KnxIpMessage.compose(
                KnxServiceId.TUNNEL_REQUEST, [
                    TunnelingRequest.compose(channel, nextSeq()),
                    cemiFrame
                ]
            ))
        }
    }
}

export { messageHandler }
