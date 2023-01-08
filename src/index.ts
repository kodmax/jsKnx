import { DPT_Value_Temp, KnxLink } from './lib'

KnxLink.connect('192.168.0.8', { readTimeout: 500 }).then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    knx.events.on('error', e => {
        console.log(e)
    })

    knx.events.on('cemi-frame', frame => {
        console.log(frame.target, frame.getDataByteZero(), frame.value, frame.value.length)
    })

    knx.getDatapoint({ address: '15/0/11', DataType: DPT_Value_Temp }).read().then(reading => console.log(reading))
    knx.getDatapoint({ address: '15/0/9', DataType: DPT_Value_Temp }).read().then(reading => console.log(reading))
    knx.getDatapoint({ address: '15/0/5', DataType: DPT_Value_Temp }).read().then(reading => console.log(reading))
    knx.getDatapoint({ address: '15/0/8', DataType: DPT_Value_Temp }).read().then(reading => console.log(reading))
    knx.getDatapoint({ address: '13/0/2', DataType: DPT_Value_Temp }).read().then(reading => console.log(reading))

    process.on('SIGINT', () => {
        knx.disconnect().then(() => process.exit(0))
    })
})
