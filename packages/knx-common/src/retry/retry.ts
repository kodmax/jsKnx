import { RetryAbortedError } from './RetryAbortedError'

const ABORTABLE_PAUSE_POLL_MS = 50

const pause = async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const abortablePause = async (ms: number, isStopped: () => boolean): Promise<void> => {
    const deadline = Date.now() + ms

    while (Date.now() < deadline) {
        if (isStopped()) {
            return
        }

        await pause(Math.min(ABORTABLE_PAUSE_POLL_MS, deadline - Date.now()))
    }
}

const retry = async (maxRetry: number, msPause: number, cb: (stop: () => void) => Promise<void>): Promise<void> => {
    let stopped = false
    let succeeded = false

    const stop = (): void => {
        stopped = true
    }

    for (let attempt = 0; attempt <= maxRetry && !stopped; attempt++) {
        try {
            await cb(stop)
            succeeded = true
            break
        } catch (e) {
            if (attempt === maxRetry) {
                throw e
            }

            await abortablePause(msPause, () => stopped)
        }
    }

    if (stopped && !succeeded) {
        throw new RetryAbortedError()
    }
}

export { ABORTABLE_PAUSE_POLL_MS, retry, RetryAbortedError }
