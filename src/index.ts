import { DPT_Date, DPT_DateTime, DPT_Time, KnxLink } from './lib'

console.log('Connecting ...')
KnxLink.connect('192.168.0.8', { readTimeout: 500 }).then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    knx.events.on('error', e => {
        console.log(e)
    })

    knx.events.on('cemi-frame', frame => {
        console.log(frame.target, frame.getDataByteZero(), frame.value, frame.value.length)
    })

    const now = new Date()
    const date = now.toISOString().substring(0, 10)
    const time = now.toString().substring(16, 24)
    console.log(date, time)

    await knx.getDatapoint({ address: '1/0/1', DataType: DPT_DateTime }).write(DPT_DateTime.setDateTime(date, time, DPT_DateTime.isDST(now)))
    await knx.getDatapoint({ address: '1/0/2', DataType: DPT_Date }).write(date)
    await knx.getDatapoint({ address: '1/0/3', DataType: DPT_Time }).write(time)

    process.on('SIGINT', () => {
        knx.disconnect().then(() => process.exit(0))
    })
})

KnxLink.connect('192.168.0.8').then(async knx => {

    await knx.disconnect()
    process.exit(0)
})
