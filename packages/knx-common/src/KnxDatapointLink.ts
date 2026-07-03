import type { KnxLinkException } from './KnxLinkException'

export type KnxDatapointLinkListener<TCemiFrame> = (frame: TCemiFrame) => void

export type KnxDatapointLink<TCemiFrame = unknown> = {
    sendCemiFrame(cemiFrame: Buffer): Promise<void>
    on(event: 'cemi-frame', listener: KnxDatapointLinkListener<TCemiFrame>): KnxDatapointLink<TCemiFrame>
    off(event: 'cemi-frame', listener: KnxDatapointLinkListener<TCemiFrame>): KnxDatapointLink<TCemiFrame>
    emit(event: 'error', error: KnxLinkException): boolean
}
