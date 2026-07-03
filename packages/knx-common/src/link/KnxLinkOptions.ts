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
     * Timeout (ms) for the initial KNX/IP tunnel handshake.
     * @default 10000
     */
    connectionTimeout: number
}

export type RequiredKnxLinkOptions = Required<KnxLinkOptions>

/** Optional link options passed to `new KnxLink(ip, options)`. Omitted fields use the `@default` values from {@link KnxLinkOptions}. */
export type KnxLinkConstructorOptions = Partial<RequiredKnxLinkOptions>
