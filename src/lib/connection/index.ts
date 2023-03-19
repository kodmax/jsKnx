import { KnxIpMessage, hpai } from '../message'
import { KnxConnectionType, KnxLayer, KnxServiceId } from '../enums'
import connect, { InternalLinkInfo, KnxLinkOptions } from './connect'

import { Socket } from 'dgram'
import { retry } from './retry'
import { KnxLinkException } from '../types'
import { connectSockets } from './connect/connect-sockets'

export * from './link'

/**
 * Docs
 * http://www.eb-systeme.de/?page_id=479
 */
export class KnxConnection {
    private noReconnection: boolean = false
    private linkInfo?: InternalLinkInfo

    public constructor (
        private readonly options: KnxLinkOptions,
        private readonly ip: string,
        private readonly connectionType: KnxConnectionType,
        private readonly layer: KnxLayer
    ) {

    }

    public async connect (): Promise<void> {
        const [gateway, tunnel] = await connectSockets(this.ip, this.options.port)
        await retry(this.options.maxRetry, this.options.retryPause, async () => {
            if (!this.noReconnection) {
                this.linkInfo = await connect(this.options, gateway, tunnel, this.connectionType, this.layer)
                this.linkInfo.gateway.once('close', () => {
                    setTimeout(() => {
                        this.connect().catch(() => {
                            // ignore
                        })
                    }, this.options.retryPause)
                })

                this.linkInfo.tunnel.once('close', () => {
                    this.terminate()
                })

                this.linkInfo.gateway.on('message', data => {
                    const ipMessage = KnxIpMessage.decode(data)

                    if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_REQUEST) {
                        this.terminate()
                        this.connect()

                    } else if (ipMessage.getServiceId() === KnxServiceId.DISCONNECT_RESPONSE) {
                        this.noReconnection = true
                        this.terminate()
                    }
                })
            }
        })
    }

    public getLinkInfo (): InternalLinkInfo {
        if (this.linkInfo) {
            return this.linkInfo

        } else {
            throw new KnxLinkException('NO_CONNECTION', 'Gateway connection not established', {})
        }
    }

    private terminate (): void {
        if (this.linkInfo) {
            try {
                this.linkInfo.gateway.close()

            } catch (e) {
                // ignore
            }

            try {
                this.linkInfo.tunnel.close()

            } catch (e) {
                // ignore
            }
        }
    }

    /**
     * Gracefully close the knx gateway connection
     */
    public async disconnect (): Promise<void> {
        this.noReconnection = true

        if (this.linkInfo) {
            this.sendTo(
                this.linkInfo.gateway,
                KnxIpMessage.compose(
                    KnxServiceId.DISCONNECT_REQUEST,
                    [
                        Buffer.from([this.linkInfo.channel, 0x00]),
                        hpai(this.linkInfo.gateway.address())
                    ]
                )
            )
        }
    }

    private async sendTo (socket :Socket, message: KnxIpMessage): Promise<void> {
        return new Promise((resolve, reject) => {

            socket.send(message.getBuffer(), error => {
                if (error) {
                    this.terminate()

                    this.linkInfo = void 0
                    reject(error)

                } else {
                    resolve()
                }
            })
        })
    }
}
