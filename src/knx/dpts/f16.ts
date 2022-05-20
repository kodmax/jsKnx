import { F16 } from "../formats"
import { DPT } from "../enums"

export class DPT_Value_Temp extends F16 {
    public readonly type: DPT = DPT.Value_Temp
    public readonly unit: string = "°C"
}

export class DPT_Value_AirQuality extends F16 {
    public readonly type: DPT = DPT.Value_AirQuality
    public readonly unit: string = "ppm"
}

export class DPT_Value_Humidity extends F16 {
    public readonly type: DPT = DPT.Value_Humidity
    public readonly unit: string = "%"
}
