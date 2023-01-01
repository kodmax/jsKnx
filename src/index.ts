import { DPT_Value_Temp, KnxLink } from './lib'
import { temp } from './home.knx-schema'

KnxLink.connect('192.168.0.8').then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    const temps: DPT_Value_Temp[] = (Object.keys(temp) as Array<keyof typeof temp>).map(name => knx.getDatapoint(temp[name]))

    await Promise.all(temps.map(dp => dp.read().then(reading => console.log(reading.target))))

    // await knx.disconnect()
    process.on('SIGINT', () => {
        knx.disconnect().then(() => process.exit(0))
    })
})
