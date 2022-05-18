export type KnxMessageCallback = (msg: KnxMessage) => Promise<void>
export type KnxEventType = "message" | "error"
export type KnxMessage = {
    body: Buffer
}

export interface IKnxGateway {
    removeEventListener(eventType: KnxEventType, cb: KnxMessageCallback)
    addEventListener(eventType: KnxEventType, cb: KnxMessageCallback)
    send(message: Buffer): Promise<void>
}

type Component = {
    address: string
    name: string
    uid?: string
    pin: number
}

type Func = {
    components: Component[]
    name: string
}

type Location = {
    functions: Func[]
    name: string
}

export type KnxSchemaDeclaration = {
    locations: Location[]
    port?: number
    name: string
    ip?: string
}
