import { KnxConnectionType, KnxLayer } from '../enums'

export function cri (type: KnxConnectionType, layer: KnxLayer): Buffer {
    return Buffer.from([0x04, type, layer, 0x00])
}
