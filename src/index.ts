import { KnxLink } from "./lib"
import { energy } from "./home.knx-schema"

KnxLink.connect("192.168.0.8").then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    console.log(await knx.getDatapoint(energy.InstantPowerDraw.reading).read())

    console.log(await knx.getDatapoint(energy["Intermediate Consumption Meter"].Status).read())

    await knx.disconnect()
    await knx.close()

    process.on("SIGINT", () => {
        knx.disconnect().then(() => process.exit(0))
    })
})

