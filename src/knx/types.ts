import { DPT } from "./enums"

export type KnxIpMessageCallback = (msg: KnxIpMessage) => Promise<void>
export type KnxEventType = "state" | "command" | "write"
export type KnxIpMessage = {
    body: Buffer
}

type Component = {
    links?: string[]
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

type TopGroup = {
    name: string
    id: number
    items: MidGroup[]
}

type MidGroup = {
    name: string
    id: number
    items: Group[]
}

type Group = {
    dataType: keyof DPT
    description: string
    title?: string
    name: string
    id: number
}

export type KnxSchemaDeclaration = {
    locations: Location[]
    groups: TopGroup[]
    port?: number
    name: string
    ip?: string
}

export interface IDPT {

}