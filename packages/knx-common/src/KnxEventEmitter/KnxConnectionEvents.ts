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
