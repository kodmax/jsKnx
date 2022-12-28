import { KnxIpMessage, hpai } from '../message'
import { KnxConnectionType, KnxLayer, KnxServiceId } from '../enums'
import connect, { KnxLinkInfo } from './connect'

import { Socket } from 'dgram'
import { KnxLinkOptions } from '../types'

/**
 * Docs
 * http://www.eb-systeme.de/?page_id=479
 */
export class KnxConnection {
    private linkInfo?: KnxLinkInfo

    public constructor (private readonly options: KnxLinkOptions, private readonly ip: string, private readonly connectionType: KnxConnectionType, private readonly layer: KnxLayer) {

    }

    public async connect (): Promise<void> {
        for (let attempt = 0; attempt <= this.options.maxRetry; attempt++) {
            try {
                this.terminate()

                this.linkInfo = await connect(this.options, this.ip, this.connectionType, this.layer)
                break

            } catch (e) {
                await new Promise(resolve => setTimeout(resolve, this.options.retryPause))
            }
        }
    }

    public getLinkInfo (): KnxLinkInfo {
        if (this.linkInfo) {
            return this.linkInfo

        } else {
            throw new Error('Knx connection not established')
        }
    }

    public async send (message: KnxIpMessage): Promise<void> {
        for (let attempt = 0; attempt <= this.options.maxRetry; attempt++) {
            try {
                if (!this.linkInfo) {
                    this.linkInfo = await connect(this.options, this.ip, this.connectionType, this.layer)
                }

                return await this.sendTo(this.linkInfo.tunnel, message)

            } catch (e) {
                await new Promise(resolve => setTimeout(resolve, this.options.retryPause))
            }
        }
    }

    /**
     * Closes network connection without closing the logical knx link.
     */
    public terminate (): void {
        if (this.linkInfo) {
            this.linkInfo.gateway.close()
            this.linkInfo.tunnel.close()
        }
    }

    /**
     * Gracefully close the knx gateway connection
     */
    public async disconnect (): Promise<void> {
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
