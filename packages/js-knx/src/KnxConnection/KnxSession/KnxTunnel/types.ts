import type { KnxIpMessage } from '@repo/knx-common'
import type { KnxCemiFrame } from '@repo/knx-common'
import type { KnxLinkException } from '@repo/knx-common'

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
