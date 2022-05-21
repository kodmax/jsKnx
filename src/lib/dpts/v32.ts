import { V32 } from "./formats"
import { DPT } from "../enums"

export class DPT_ActiveEnergy extends V32 {
    public readonly type: DPT = DPT.ActiveEnergy
    public readonly unit: string = "Wh"
}
