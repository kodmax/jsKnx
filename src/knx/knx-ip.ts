import { Socket, createSocket } from "dgram";
import * as fs from "fs"

import { KnxSchemaDeclaration, KnxSchema } from "./schema";
import { Knx } from "./knx"

export class KnxIp {
    private static async socket(ip: string, port: number = 3671): Promise<Socket> {
        const socket: Socket = createSocket('udp4')

        return new Promise((resolve, reject) => {
            socket.on('error', err => {
                socket.close()
                reject(err)
            })

            socket.on('connect', () => {
                resolve(socket)
            })
            
            socket.connect(port, ip)
        })
    }

    public static async connect(ip: string, port: number = 3671): Promise<Knx> {
        return new Knx(new KnxIp(await KnxIp.socket(ip, port)))
    }

    public static async connectSchema(path: string, ip?: string): Promise<KnxSchema> {
        const schema: KnxSchemaDeclaration = JSON.parse(await fs.promises.readFile(path, { encoding: 'utf-8' }))
        const destIp: string = ip || schema.ip || ''
        if (destIp) {
            const socket = await KnxIp.socket(destIp, schema.port)
            const knxIp = new KnxIp(socket)
    
            return new KnxSchema(schema, new Knx(knxIp), knxIp)
    
        } else {
            throw new Error("No IP speciefied for the schema")
        }
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