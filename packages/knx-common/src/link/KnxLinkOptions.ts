export type KnxReceiveContext = {
    groupAddress: string
    dpt: string
    source: string
}

export type KnxLinkOptions = {
    /**
     * Max telegrams awaiting gateway ACK before back-pressure.
     * @default 16
     */
    maxConcurrentMessages: number
    /**
     * Maximum telegrams per second rate.
     * Decrease if there are readValue timeouts.
     * @default 24
     */
    maxTelegramsPerSecond: number

    /**
     * Timeout (ms) for `read()` waiting for a group response.
     * @default 10000
     */
    readTimeout: number

    /**
     * KNX/IP UDP port of the gateway.
     * @default 3671
     */
    port: number

    /**
     * Retries when the gateway rejects connection (e.g. both tunnel slots busy).
     * @default Infinity
     */
    maxRetry: number

    /**
     * Pause (ms) between connection retries; also used for automatic reconnect after network loss.
     * @default 3000
     */
    retryPause: number

    /**
     * Whether to automatically reconnect after gateway or network disconnects.
     * @default true
     */
    autoReconnect: boolean

    /**
     * Timeout (ms) for the initial KNX/IP tunnel handshake.
     * @default 10000
     */
    connectionTimeout: number

    /**
     * Optional callback invoked after a successful decode of a push group write
     * (`APCI_GROUP_VALUE_WRITE`). Does not run for read responses.
     */
    onReceive?: (ctx: KnxReceiveContext) => void
}

export type RequiredKnxLinkOptions = Required<Omit<KnxLinkOptions, 'onReceive'>> & Pick<KnxLinkOptions, 'onReceive'>

/** Optional link options passed to `new KnxLink(ip, options)`. Omitted fields use the `@default` values from {@link KnxLinkOptions}. */
export type KnxLinkConstructorOptions = Partial<RequiredKnxLinkOptions>
