import { DPT_Generic_B1, KnxLink } from './lib'

KnxLink.connect('192.168.0.8', { readTimeout: 500 }).then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    knx.events.on('error', e => {
        console.log(e)
    })

    let frameCounter = 0
    knx.events.on('cemi-frame', frame => {
        if (frame.target === '2/0/5') {
            console.log(++frameCounter, frame.target)
        } else {
            console.log(frame.target)
        }
    })

    const dp = knx.getDatapoint({ address: '2/0/5', DataType: DPT_Generic_B1 })
    for (let i = 0; i < 200; i++) {
        dp.read().then(reading => {
            console.log(i, reading)
        }, e => {
            console.log(i, 'read error', e.message)
        })
        await new Promise(resolve => setTimeout(resolve, 10))
    }

    process.on('SIGINT', () => {
        knx.disconnect().then(() => process.exit(0))
    })
})
