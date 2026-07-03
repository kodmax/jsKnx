import { KnxLinkException } from './KnxLinkException'

export function knxNetworkError(error: unknown): KnxLinkException {
    const message = error instanceof Error ? error.message : String(error)
    return new KnxLinkException('NETWORK_ERROR', message, {})
}
