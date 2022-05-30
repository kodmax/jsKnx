import { Z8 } from "./formats"
import { DPT } from "../enums"

export class DPT_StatusGen extends Z8 {
    public readonly type: DPT = DPT.StatusGen
    public readonly unit: string = ""
}