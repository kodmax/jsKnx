import { KnxLink } from "./lib"
import { lights, sensors } from "./home.knx-schema"

KnxLink.connect("192.168.0.8").then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    await knx.groupFromSchema(sensors["Sensory.Powietrze.Wilgotnosc powietrza"], dp => {
        dp.addValueListener(async value => {
            console.log(dp.toString(value))
        })

        dp.requestValue()
    })

    await knx.groupFromSchema(lights["Oswietlenie.Salon.Caly Salon LED On/Off"]).on()

    process.on("SIGINT", () => {
        knx.disconnect().then(() => process.exit(0))
    })
})

