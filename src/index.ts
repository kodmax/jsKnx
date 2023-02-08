import { DPT_Trigger, DPT_Value_Temp, KnxLink } from './lib'

console.log('connecting')
KnxLink.connect('192.168.0.8', { readTimeout: 500 }).then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    knx.events.on('error', e => {
        console.log(e)
    })

    knx.events.on('cemi-frame', frame => {
        console.log(frame.target, frame.getDataByteZero(), frame.value, frame.value.length)
    })

    console.log('sending reset')
    await knx.getDatapoint({ address: "5/2/1", DataType: DPT_Trigger }).trigger(1)
    console.log('reset sent')

    process.on('SIGINT', () => {
        knx.disconnect().then(() => process.exit(0))
    })
})
