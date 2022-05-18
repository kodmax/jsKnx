import { Socket, createSocket } from "dgram";
import * as fs from "fs"

import { KnxSchemaDeclaration } from "../types";
import { IPGateway } from "./gateway";
import { Knx } from "../knx"

export class KnxIp {
    private static async socket(ip: string, port: number = 3671): Promise<Socket> {
        const socket: Socket = createSocket('udp4')

        return new Promise((resolve, reject) => {
            socket.connect(port, ip, () => resolve(socket))
        })
    }

    public static async connect(path: string, ip?: string, port?: number): Promise<Knx> {
        const schema  = JSON.parse(await fs.promises.readFile(path, { encoding: 'utf-8' }))
        const destIp: string = ip || schema.ip || ''
        if (destIp) {
            const gateway = new IPGateway(await KnxIp.socket(destIp, port || schema.port))
            return new Knx(gateway, schema)
    
        } else {
            throw new Error("No IP speciefied for the schema")
        }
    }

    private constructor(private readonly socket: Socket) {
        socket.on('error', err => {
            console.log('socket error', err)
        })
        
        socket.on('message', (msg, rinfo) => {
            console.log('knx message', msg)
        })
    }
    
}