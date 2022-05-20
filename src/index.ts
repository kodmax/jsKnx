import { DPT_Value_Power, Knx } from "./knx"
import { DPT_Value_AirQuality } from "./knx/datapoint-types/f16"

Knx.connect('192.168.0.8').then(async knx => {
    knx.getGroup("5/0/1", DPT_Value_Power, dp => {
        dp.addValueListener((value: number, unit: string, source: string) => {
            console.log(`Home power consumtion is ${Math.round(value)} [${unit}]`)
        })
    })

    knx.getGroup("15/0/3", DPT_Value_AirQuality, dp => {
        dp.addValueListener((value: number, unit: string, source: string) => {
            console.log(`Home CO2 level is ${Math.round(value)} [${unit}]`)
        })
    })
})
