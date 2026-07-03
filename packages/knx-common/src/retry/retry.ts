const pause = async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const retry = async (maxRetry: number, msPause: number, cb: (stop: () => void) => Promise<void>): Promise<void> => {
    let stopped = false

    const stop = (): void => {
        stopped = true
    }

    for (let attempt = 0; attempt <= maxRetry && !stopped; attempt++) {
        try {
            await cb(stop)
            break
        } catch (e) {
            if (attempt === maxRetry) {
                throw e
            }

            await pause(msPause)
        }
    }
}

export { retry }
