import { DPT_HVACMode, DPT_State, KnxLink } from './lib'

KnxLink.connect('192.168.0.8').then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    knx.getDatapoint({ address: '2/0/3', DataType: DPT_HVACMode }).read().then(reading => {
        console.log(reading.value, DPT_HVACMode.MODE[reading.value])
    })
    knx.getDatapoint({ address: '2/0/4', DataType: DPT_HVACMode }).read().then(reading => {
        console.log(reading.value, DPT_HVACMode.MODE[reading.value])
    })
    knx.getDatapoint({ address: '2/0/5', DataType: DPT_State }).read().then(reading => {
        console.log(reading.value, reading.text)
    })

    // await knx.disconnect()
    process.on('SIGINT', () => {
        knx.disconnect().then(() => process.exit(0))
    })
})
