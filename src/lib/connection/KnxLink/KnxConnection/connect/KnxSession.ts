import { hpai, KnxIpMessage } from '../../../../message'
import { KnxConnectionType, KnxLayer, KnxServiceId } from '../../../../enums'
import { InternalLinkInfo, RequiredKnxLinkOptions, LinkInfo } from '../../types'
import connect from './connect'
import { knxNetworkError } from '../../../../types'
import { KnxTransport } from './KnxTransport'
import type { OnCemiFrame } from './message-handler'

export class KnxSession {
    private constructor(private readonly linkInfo: InternalLinkInfo) {}

    static async startSession(
        transport: KnxTransport,
        options: RequiredKnxLinkOptions,
        connectionType: KnxConnectionType,
        layer: KnxLayer,
        onCemiFrame: OnCemiFrame
    ) {
        return new KnxSession(await connect(options, transport.getGateway(), transport.getTunnel(), connectionType, layer, onCemiFrame))
    }

    async sendCemiFrame(cemiFrame: Buffer): Promise<void> {
        return this.linkInfo.sendCemiFrame(cemiFrame)
    }

    onDisconnectResponse(cb: () => void): void {
        this.linkInfo.gateway.on('message', data => {
            const ipMessage = KnxIpMessage.decode(data)

            if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_RESPONSE) {
                cb()
            }
        })
    }

    onDisconnectRequest(cb: () => void): void {
        this.linkInfo.gateway.on('message', data => {
            const ipMessage = KnxIpMessage.decode(data)

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
