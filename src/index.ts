import { KnxLink } from "./lib"
import { lights } from "./home.knx-schema"

KnxLink.connect("192.168.0.8").then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    await knx.groupFromSchema(lights["Oswietlenie.Hol.Salon Hol LED On/Off"]).off()

    await knx.disconnect()
    await knx.close()

    process.on("SIGINT", () => {
        knx.disconnect().then(() => process.exit(0))
    })
})

