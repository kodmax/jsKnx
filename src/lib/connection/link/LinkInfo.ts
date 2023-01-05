import { Socket } from 'dgram'
import { KnxConnectionType, KnxLayer } from '../../enums'
import { SendCemiFrame } from '../connect/message-handler'

export type InternalLinkInfo = {
    sendCemiFrame: SendCemiFrame

    connectionType: KnxConnectionType
    gatewayAddress: string
    channel: number
    layer: KnxLayer

    gateway: Socket
    tunnel: Socket
    port: number
    ip: string
}

export type LinkInfo = {
    connectionType: KnxConnectionType
    gatewayAddress: string
    layer: KnxLayer
    channel: number
    port: number
    ip: string
}
