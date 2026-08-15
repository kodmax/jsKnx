import { ABORTABLE_PAUSE_POLL_MS, retry, RetryAbortedError } from './retry'

describe('retry', () => {
    it('resolves when callback succeeds on first attempt', async () => {
        const cb = jest.fn().mockResolvedValue(undefined)

        await retry(3, 10, cb)

        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('passes stop function to callback', async () => {
        const cb = jest.fn(async (stop: () => void) => {
            expect(typeof stop).toBe('function')
        })

        await retry(1, 10, cb)

        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('retries until success', async () => {
        const cb = jest.fn().mockRejectedValueOnce(new Error('fail 1')).mockRejectedValueOnce(new Error('fail 2')).mockResolvedValue(undefined)

        await retry(3, 10, cb)

        expect(cb).toHaveBeenCalledTimes(3)
    })

    it('throws after maxRetry exhausted', async () => {
        const error = new Error('permanent failure')
        const cb = jest.fn().mockRejectedValue(error)

        await expect(retry(2, 10, cb)).rejects.toThrow('permanent failure')
        expect(cb).toHaveBeenCalledTimes(3)
    })

    it('does not retry when maxRetry is zero', async () => {
        const cb = jest.fn().mockRejectedValue(new Error('nope'))

        await expect(retry(0, 1000, cb)).rejects.toThrow('nope')
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('throws RetryAbortedError when stop is called during a failed attempt', async () => {
        const cb = jest.fn(async (stop: () => void) => {
            stop()
            throw new Error('stopped')
        })

        await expect(retry(3, 10, cb)).rejects.toBeInstanceOf(RetryAbortedError)
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('throws RetryAbortedError when stop is called after a failed attempt', async () => {
        let calls = 0
        const cb = jest.fn(async (stop: () => void) => {
            calls++
            if (calls === 1) {
                throw new Error('fail once')
            }

            stop()
            throw new Error('stopped')
        })

        await expect(retry(3, 10, cb)).rejects.toBeInstanceOf(RetryAbortedError)
        expect(cb).toHaveBeenCalledTimes(2)
    })

    it('still throws on the final attempt even when stop was called', async () => {
        const cb = jest.fn(async (stop: () => void) => {
            stop()
            throw new Error('final failure')
        })

        await expect(retry(0, 10, cb)).rejects.toThrow('final failure')
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('does not schedule another attempt after stop', async () => {
        jest.useFakeTimers()

        const cb = jest.fn(async (stop: () => void) => {
            stop()
            throw new Error('stopped')
        })

        const promise = retry(3, 1000, cb)

        await expect(promise).rejects.toBeInstanceOf(RetryAbortedError)
        expect(cb).toHaveBeenCalledTimes(1)

        jest.useRealTimers()
    })

    it('throws RetryAbortedError quickly when stop is called during abortable pause', async () => {
        jest.useFakeTimers()

        let capturedStop: (() => void) | undefined
        const cb = jest.fn(async (stop: () => void) => {
            capturedStop = stop
            throw new Error('fail once')
        })

        const promise = retry(3, 3000, cb)
        const assertion = expect(promise).rejects.toBeInstanceOf(RetryAbortedError)

        await jest.advanceTimersByTimeAsync(100)
        capturedStop!()
        await jest.advanceTimersByTimeAsync(ABORTABLE_PAUSE_POLL_MS)

        await assertion
        expect(cb).toHaveBeenCalledTimes(1)

        jest.useRealTimers()
    })
})
