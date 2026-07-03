import { KnxConnectionType, KnxLayer } from '@repo/knx-enums'

export type LinkInfo = {
    connectionType: KnxConnectionType
    individualAddress: string
    layer: KnxLayer
    channel: number
    port: number
    ip: string
}
