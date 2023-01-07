import { DPT_Generic_B1, KnxLink } from './lib'

KnxLink.connect('192.168.0.8', { readTimeout: 500 }).then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    setInterval(() => {
        knx.getDatapoint({ address: '2/0/5', DataType: DPT_Generic_B1 }).read().then(reading => {
            console.log(reading)
        }, e => {
            console.log('read error', e.message)
        })

    }, 1000)

    // await knx.disconnect()
    process.on('SIGINT', () => {
        knx.disconnect().then(() => process.exit(0))
    })
})
