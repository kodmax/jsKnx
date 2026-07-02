import { DPT_HVACMode, KnxLink } from '../src/lib'

async function main(): Promise<void> {
    console.log('Connecting ...')

    const knx = new KnxLink('192.168.1.8', { readTimeout: 500 })

    knx.on('cemi-frame', frame => {
        console.log(frame.target, frame.getDataByteZero(), frame.value, frame.value.length)
    })
    knx.on('connecting', e => console.log('connecting', e))
    knx.on('connected', e => console.log('connected', e))
    knx.on('reconnecting', e => console.log('reconnecting', e))
    knx.on('disconnected', e => console.log('disconnected', e))

    await knx.connect()

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
}

main().catch(error => {
    console.error(error)
    process.exit(1)
})
