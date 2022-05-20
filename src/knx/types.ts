import { DPT } from "./enums"

export type KnxIpMessageCallback = (msg: KnxIpMessage) => Promise<void>
export type KnxEventType = "state" | "command" | "write"
export type KnxIpMessage = {
    body: Buffer
}

type KnxGroupDescription = {
    DPT?: keyof DPT
    DTP?: string
    name: string
}

type KnxObjectDescription = {
    function: string
    location: string
    name: string
}

export type KnxSchemaDeclaration = {
    objects: Record<string, KnxObjectDescription>
    groups: Record<string, KnxGroupDescription>
    port?: number
    name: string
    ip?: string
}

export interface IDPT {

}