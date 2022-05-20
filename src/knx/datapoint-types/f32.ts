import { F32 } from "../formats"
import { IDPT } from "../types"
import { DPT } from "../enums"

export class DPT_Value_Power extends F32 {
    public readonly type: DPT = DPT.Value_Power
    public readonly unit: string = 'W'
}
