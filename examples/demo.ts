import { DPT_HVACMode, KnxLink } from 'js-knx'

console.log('Connecting ...')
KnxLink.connect('192.168.1.8', {
    readTimeout: 500,
    onError: e => {
        console.log(e)
    },
    onCemiFrame: frame => {
        console.log(frame.target, frame.getDataByteZero(), frame.value, frame.value.length)
    }
}).then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    const livingroom = await knx.getDatapoint({ DataType: DPT_HVACMode, address: '2/0/4' }).read()
    const bathroom = await knx.getDatapoint({ DataType: DPT_HVACMode, address: '2/1/4' }).read()
    const bedroom = await knx.getDatapoint({ DataType: DPT_HVACMode, address: '2/2/4' }).read()

    console.log(livingroom)
    console.log(bathroom)
    console.log(bedroom)

    process.on('SIGINT', () => {
        knx.disconnect().then(() => process.exit(0))
    })
})
