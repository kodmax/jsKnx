import connect from './handshake'
import { KnxIpMessage, RequiredKnxLinkOptions, LinkInfo, knxNetworkError, hpai } from '@repo/knx-common'
import { KnxConnectionType, KnxLayer, KnxServiceId } from '@repo/knx-enums'
import type { InternalLinkInfo } from './types'
import { KnxTransport } from './KnxTransport'
import { KnxTunnel, OnCemiFrame } from './KnxTunnel'

export class KnxSession {
    private readonly knxTunnel: KnxTunnel

    private constructor(
        private readonly linkInfo: InternalLinkInfo,
        options: RequiredKnxLinkOptions,
        onCemiFrame: OnCemiFrame
    ) {
        this.knxTunnel = new KnxTunnel(this.linkInfo.tunnel, this.linkInfo.channel, onCemiFrame, {
            maxConcurrentMessages: options.maxConcurrentMessages,
            maxTelegramsPerSecond: options.maxTelegramsPerSecond
        })
    }

    static async startSession(
        transport: KnxTransport,
        options: RequiredKnxLinkOptions,
        connectionType: KnxConnectionType,
        layer: KnxLayer,
        onCemiFrame: OnCemiFrame
    ) {
        return new KnxSession(await connect(options, transport.getGateway(), transport.getTunnel(), connectionType, layer), options, onCemiFrame)
    }

    async sendCemiFrame(cemiFrame: Buffer): Promise<void> {
        return this.knxTunnel.sendCemiFrame(cemiFrame)
    }

    onGatewayMessage(cb: (message: KnxIpMessage) => void): void {
        this.linkInfo.gateway.on('message', data => {
            let ipMessage: KnxIpMessage

            try {
                ipMessage = KnxIpMessage.decode(data)
            } catch {
                return
            }

            cb(ipMessage)
        })
    }

    onDisconnectResponse(cb: () => void): void {
        this.linkInfo.gateway.on('message', data => {
            let ipMessage: KnxIpMessage

            try {
                ipMessage = KnxIpMessage.decode(data)
            } catch {
                return
            }

            if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_RESPONSE) {
                cb()
            }
        })
    }

    onDisconnectRequest(cb: () => void): void {
        this.linkInfo.gateway.on('message', data => {
            let ipMessage: KnxIpMessage

            try {
                ipMessage = KnxIpMessage.decode(data)
            } catch {
                return
            }

            if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_REQUEST) {
                cb()
            }
        })
    }

    public getLinkInfo(): LinkInfo {
        return {
            connectionType: this.linkInfo.connectionType,
            individualAddress: this.linkInfo.individualAddress,
            channel: this.linkInfo.channel,
            layer: this.linkInfo.layer,
            port: this.linkInfo.port,
            ip: this.linkInfo.ip
        }
    }

    private async sendGatewayMessage(message: KnxIpMessage): Promise<void> {
        return new Promise((resolve, reject) => {
            this.linkInfo.gateway.send(message.getBuffer(), error => {
                if (error) {
                    reject(knxNetworkError(error))
                } else {
                    resolve()
                }
            })
        })
    }

    async requestDisconnect(): Promise<void> {
        await this.sendGatewayMessage(
            KnxIpMessage.compose(KnxServiceId.DISCONNECT_REQUEST, [Buffer.from([this.linkInfo.channel, 0x00]), hpai(this.linkInfo.gateway.address())])
        )
    }
}
