import { AddressInfo } from 'net'

export enum KnxIpProtocol {
    IPV4_UDP = 0x01,
    IPV4_TCP = 0x02
}

export function hpai ({ address, port }: AddressInfo): Buffer {
    return Buffer.from([0x08, KnxIpProtocol.IPV4_UDP, ...address.split(/\./g).map(oct => +oct), (port & 0xff00) >> 8, port & 0xff])
}
