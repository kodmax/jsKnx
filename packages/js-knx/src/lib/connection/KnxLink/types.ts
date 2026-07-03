import { Socket } from 'dgram'
import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'
import { KnxLinkException } from '../../types'
import type { IDPT } from '@repo/knx-dpts'
import type { KnxLink } from './KnxLink'
export type OnError = (error: KnxLinkException) => void

export type KnxLinkOptions = {
    /**
     * Maximum number of cemi frames to sent before waiting for gateway acknowledgement.
     */
    maxConcurrentMessages: number
    /**
     * Maximum telegrams per second rate.
     * Decrease if there are readValue timeouts.
     */
    maxTelegramsPerSecond: number

    /**
     * Default 10000ms, applied to read() method. May be increased for busy networks or decreased to tiny ones.
     */
    readTimeout: number

    /**
     * When not specified, standard 3671 is used
     */
    port: number

    /**
     * Maximum number of retries on IP network failure.
     */
    maxRetry: number

    /**
     * How long to pause when error occurs
     */
    retryPause: number

    connectionTimeout: number
}

export type RequiredKnxLinkOptions = Required<KnxLinkOptions>

export type KnxLinkConstructorOptions = Partial<RequiredKnxLinkOptions>

export type InternalLinkInfo = {
    connectionType: KnxConnectionType
    individualAddress: string
    channel: number
    layer: KnxLayer

    gateway: Socket
    tunnel: Socket
    port: number
    ip: string
}

export type LinkInfo = {
    connectionType: KnxConnectionType
    individualAddress: string
    layer: KnxLayer
    channel: number
    port: number
    ip: string
}

export type KnxDisconnectedReason = 'graceful' | 'disconnect-timeout' | 'unexpected-socket-close' | 'gateway-request' | 'network-connect-failed'

export type KnxConnectingEvent = {
    ip: string
    port: number
}

export type KnxNetworkConnectionEstablishedEvent = {
    ip: string
    port: number
}

export type KnxStartingSessionEvent = {
    ip: string
    port: number
}

export type KnxReconnectingEvent = {
    delayMs: number
}

export type KnxDisconnectedEvent = {
    reason: KnxDisconnectedReason
}

export type DatapointConstructor<T extends IDPT> = new (address: string, link: KnxLink, options: RequiredKnxLinkOptions) => T

export type KnxGroupSchema<T extends IDPT> = {
    DataType: DatapointConstructor<T>
    address: string
}
