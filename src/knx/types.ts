export type KnxIpMessageCallback = (msg: KnxIpMessage) => Promise<void>
export type KnxEventType = "state" | "command" | "write"
export type KnxIpMessage = {
    body: Buffer
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

export interface IDPT {

}