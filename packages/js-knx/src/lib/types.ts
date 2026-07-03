export { KnxLinkException, KnxLinkExceptionCode, KnxLinkExceptionDetails, KnxReading } from '@repo/knx-common'
import { KnxLinkException } from '@repo/knx-common'

export function knxNetworkError(error: unknown): KnxLinkException {
    const message = error instanceof Error ? error.message : String(error)
    return new KnxLinkException('NETWORK_ERROR', message, {})
}
