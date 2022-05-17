import { B1 } from "../formats"


export class DPT_Switch extends B1 {
    public async on(): Promise<void> {
        return this.write(true)
    }

    public async off(): Promise<void> {
        return this.write(false)
    }

    public async state(): Promise<boolean> {
        return this.read()
    }
}