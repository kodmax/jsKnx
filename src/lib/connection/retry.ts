const pause = async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const retry = async (maxRetry: number, msPause: number, cb: () => Promise<void>): Promise<void> => {
    for (let attempt = 0; attempt <= maxRetry; attempt++) {
        try {
            await cb()
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
