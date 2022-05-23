import { DPT_ActiveEnergy, DPT_Value_Power, KnxLink, DPT_Value_Temp, DPT_Value_AirQuality, DPT_Switch, DPT_DateTime, KnxDateTime, DPT_Date, DPT_Time, DPT_Start } from "./lib"
import { DayOfWeek } from "./lib/dpts/formats/time-of-day"

KnxLink.connect("192.168.0.8").then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    knx.group("5/0/1", DPT_Value_Power, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home power consumtion is ${Number(value).toFixed(0)} [${unit}]`)
        })

        // setInterval(() => dp.requestValue(), 1000)
    })

    await knx.group("5/2/1", DPT_Start).start()
    /**
     * Total energy reading
     */
    knx.group("5/2/3", DPT_ActiveEnergy, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home total energy reading is ${Number(value).toFixed(0)} [${unit}]`)
        })

        // setInterval(() => dp.requestValue(), 1000)
    })

    knx.group("15/0/3", DPT_Value_AirQuality, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home CO2 level is ${dp.toString(value)} [${unit}]`)
        })

        setInterval(() => dp.requestValue(), 1000)
    })

    // knx.group("13/0/2", DPT_Value_Temp, dp => {
    //     dp.addValueListener((value: number, unit: string) => {
    //         console.log(`Bathroom floor temperature is ${Number(value).toFixed(1)} [${unit}]`)
    //     })

    //     dp.requestValue()
    // })

    // knx.group("15/0/8", DPT_Value_Temp, dp => {
    //     dp.addValueListener((value: number, unit: string) => {
    //         console.log(`Bathroom air temperature is ${(Number(value).toFixed(1))} [${unit}]`)
    //     })

    //     dp.requestValue()
    // })

    // knx.group("15/0/6", DPT_Value_Temp, dp => {
    //     dp.addValueListener((value: number, unit: string) => {
    //         console.log(`Bedroom air temperature is ${Number(value).toFixed(1)} [${unit}]`)
    //     })

    //     dp.requestValue()
    // })

    // knx.group("15/0/0", DPT_Value_Temp, dp => {
    //     dp.addValueListener((value: number, unit: string) => {
    //         console.log(`Livingroom air temperature is ${Number(value).toFixed(1)} [${unit}]`)
    //     })

    //     dp.requestValue()
    // })

    // knx.group("14/6/9", DPT_Switch, dp => {
    //     dp.addValueListener((value: number, unit: string, source: string) => {
    //         console.log(`Livingroom LED 1 command ${value ? 'Turn On' : 'Turn Off'} from ${source}`)
    //     })

    //     dp.write(1)
    // })

    knx.group("14/6/10", DPT_Switch, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`${dp} Livingroom LED 1 state is "${dp.toString(value)}"`)
            setTimeout(() => dp.group("14/6/9", DPT_Switch).write(1 - value), 2000)
        })

        dp.requestValue()
    })

    // knx.group("1/0/1", DPT_DateTime, dp => {
    //     dp.addValueListener((value: KnxDateTime, unit, source) => {
    //         console.log(`DateTime from ${source}`, value)
    //     })

    //     // dp.setDateTime(new Date().toISOString().substring(0, 10), new Date().toString().substring(16, 24), true, DayOfWeek.Sat)
    //     // dp.requestValue()
    // })

    // knx.group("1/0/2", DPT_Date, dp => {
    //     dp.addValueListener((value: string, unit, source) => {
    //         console.log(`Date from ${source}`, value)
    //     })

    //     dp.write(new Date().toISOString().substring(0, 10))
    //     dp.requestValue()
    // })

    // knx.group("1/0/3", DPT_Time, dp => {
    //     dp.addValueListener((value: string, unit, source) => {
    //         console.log(`Time from ${source}`, value)
    //     })

    //     dp.write(new Date().toString().substring(16, 24))
    //     dp.requestValue()
    // })

    process.on("SIGINT", () => {
        knx.disconnect().then(() => process.exit(0))
    })
})

