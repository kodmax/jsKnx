import { DPT_ActiveEnergy, DPT_Value_Power, KnxLink, DPT_Value_Temp, DPT_Value_AirQuality, DPT_Switch } from "./knx"

KnxLink.connect("192.168.0.8").then(async knx => {
    knx.getGroup("5/0/1", DPT_Value_Power, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home power consumtion is ${Number(value).toFixed(0)} [${unit}]`)
        })

        dp.requestValue()
    })

    knx.getGroup("5/2/3", DPT_ActiveEnergy, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home total energy reading is ${Number(value).toFixed(0)} [${unit}]`)
        })

        dp.requestValue()
    })

    knx.getGroup("15/0/3", DPT_Value_AirQuality, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home CO2 level is ${Number(value).toFixed(0)} [${unit}]`)
        })

        dp.requestValue()
    })

    knx.getGroup("13/0/2", DPT_Value_Temp, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Bathroom floor temperature is ${Number(value).toFixed(1)} [${unit}]`)
        })

        dp.requestValue()
    })

    knx.getGroup("15/0/8", DPT_Value_Temp, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Bathroom air temperature is ${(Number(value).toFixed(1))} [${unit}]`)
        })

        dp.requestValue()
    })

    knx.getGroup("15/0/6", DPT_Value_Temp, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Bedroom air temperature is ${Number(value).toFixed(1)} [${unit}]`)
        })

        dp.requestValue()
    })

    knx.getGroup("15/0/0", DPT_Value_Temp, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Livingroom air temperature is ${Number(value).toFixed(1)} [${unit}]`)
        })

        dp.requestValue()
    })

    knx.getGroup("14/6/9", DPT_Switch, dp => {
        dp.addValueListener((value: number, unit: string, source: string) => {
            console.log(`Livingroom LED 1 command ${value ? 'Turn On' : 'Turn Off'} from ${source}`)
        })

        dp.requestValue()
    })

    knx.getGroup("14/6/10", DPT_Switch, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Livingroom LED 1 state is ${value ? 'On' : 'Off'}`)
        })

        dp.requestValue()
    })
})
