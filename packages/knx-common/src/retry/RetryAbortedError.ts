class RetryAbortedError extends Error {
    constructor() {
        super('Retry aborted')
        this.name = 'RetryAbortedError'
    }
}

export { RetryAbortedError }
