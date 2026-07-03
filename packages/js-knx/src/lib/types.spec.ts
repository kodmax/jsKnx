import { knxNetworkError } from './types'

describe('knxNetworkError', () => {
    it('wraps socket errors as NETWORK_ERROR', () => {
        const error = knxNetworkError(new Error('ECONNREFUSED'))

        expect(error.code).toBe('NETWORK_ERROR')
        expect(error.message).toContain('ECONNREFUSED')
    })
})
