import { retry } from './retry'

describe('retry', () => {
    it('resolves when callback succeeds on first attempt', async () => {
        const cb = jest.fn().mockResolvedValue(undefined)

        await retry(3, 10, cb)

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
})
