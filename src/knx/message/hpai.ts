import { Socket } from "dgram"
import { KnxIpProtocol } from "../enums";

export function hpai (socket: Socket): Buffer {
    const { address, port } = socket.address()
    
    return Buffer.from([0x08, KnxIpProtocol.IPV4_UDP, ...address.split(/\./g).map(oct => +oct), (port & 0xff00) >> 8, port & 0xff])
}