import { Socket, createSocket } from "dgram";
import { Knx } from "./knx"

export class KnxIp {
    public static async connect(ip: string, port: number = 3671): Promise<Knx> {
        const knx: Socket = createSocket('udp4')
        return new Promise((resolve, reject) => {
            knx.on('error', err => {
                knx.close()
                reject(err)
            })

            knx.on('connect', () => {
                resolve(new Knx(new KnxIp(knx)))
            })
            
            knx.connect(port, ip)
        })
    }

    private constructor(private readonly knx: Socket) {
        knx.on('message', (msg, rinfo) => {
            console.log('knx message', msg)
        })
    }
    
    private async send(): Promise<void> {
        const header = [0x06, 0x10, ]
        // this.knx.send()
    }
}