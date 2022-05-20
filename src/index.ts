import { DPT_ActiveEnergy, DPT_Value_Power, KnxLink, DPT_Value_Temp, DPT_Value_AirQuality } from "./knx"

KnxLink.connect("192.168.0.8").then(async knx => {
    knx.getGroup("5/0/1", DPT_Value_Power, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home power consumtion is ${Math.round(value)} [${unit}]`)
        })
    })

    knx.getGroup("5/2/3", DPT_ActiveEnergy, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home total energy reading is ${Math.round(value)} [${unit}]`)
        })
    })

    knx.getGroup("15/0/3", DPT_Value_AirQuality, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home CO2 level is ${Math.round(value)} [${unit}]`)
        })
    })

    knx.getGroup("13/0/2", DPT_Value_Temp, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Bathroom floor temperature is ${Math.round(value)} [${unit}]`)
        })
    })
    knx.getGroup("15/0/8", DPT_Value_Temp, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Bathroom air temperature is ${Math.round(value)} [${unit}]`)
        })
    })
    knx.getGroup("15/0/6", DPT_Value_Temp, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Bedroom air temperature is ${Math.round(value)} [${unit}]`)
        })
    })
    knx.getGroup("15/0/0", DPT_Value_Temp, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Livingroom air temperature is ${Math.round(value)} [${unit}]`)
        })
    })
})
