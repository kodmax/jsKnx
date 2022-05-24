import { DPT_Ack, KnxLink } from "./lib"
import { lights, airQuality } from "./home.knx-schema"

KnxLink.connect("192.168.0.8").then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    await knx.getDatapoint(airQuality.Wilgotność.alertHigh, dp => {
        dp.addValueListener(async value => {
            console.log(dp.toString(value))
        })

        dp.requestValue()
    })

    process.on("SIGINT", () => {
        knx.disconnect().then(() => process.exit(0))
    })
})

