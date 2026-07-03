import type { KnxCemiFrame, KnxIpMessage } from './message'
import type { KnxLinkException } from '../../../../../types'

export type KnxTunnelOptions = {
    maxConcurrentMessages: number
    maxTelegramsPerSecond: number
}

export type SendCemiFrame = (cemiFrame: Buffer) => Promise<void>
export type OnCemiFrame = (cemiFrame: KnxCemiFrame) => void

export type PendingMessage = {
    packet: KnxIpMessage
    resolve: () => void
    reject: (error: KnxLinkException) => void
}
