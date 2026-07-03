import { Socket } from 'dgram'
import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'
import type { RequiredKnxLinkOptions } from '@repo/knx-common'

export type InternalLinkInfo = {
    connectionType: KnxConnectionType
    individualAddress: string
    channel: number
    layer: KnxLayer

    gateway: Socket
    tunnel: Socket
    port: number
    ip: string
}

export type Connect = (
    options: RequiredKnxLinkOptions,
    gateway: Socket,
    tunnel: Socket,
    connectionType: KnxConnectionType,
    layer: KnxLayer
) => Promise<InternalLinkInfo>
