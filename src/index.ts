import { KnxLink } from "./lib"
import { home } from "./home.knx-schema"

KnxLink.connect("192.168.0.8").then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    knx.groupFromSchema(home["EnergyMeter.InstanPowerUsage"], dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home power consumtion is ${Number(value).toFixed(0)} [${unit}]`)
        })
    })

    knx.groupFromSchema(home["EnergyMeter.Total"], dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home total energy reading is ${Number(value).toFixed(0)} [${unit}]`)
        })
    })

    knx.groupFromSchema(home.CO2, dp => {
        dp.addValueListener((value: number, unit: string) => {
            console.log(`Home CO2 level is ${dp.toString(value)} [${unit}]`)
        })

        dp.requestValue()
    })

    process.on("SIGINT", () => {
        knx.disconnect().then(() => process.exit(0))
    })
})

