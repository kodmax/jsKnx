import { DPT_Switch, DPT_Value_Temp, KnxLink } from './lib'

const temps = [
    '13/0/2',
    '15/0/4',
    '15/0/0',
    '15/0/7',
    '15/0/8',
    '15/0/6',
    '15/0/9'
]

const leds = [
    '14/2/1',
    '14/2/6',
    '14/3/6',
    '14/3/8',
    '14/4/2',
    '14/4/8',
    '14/4/9',
    '14/5/2',
    '14/6/11',
    '14/6/9',
    '14/7/8',
    '14/7/3'
]

KnxLink.connect('192.168.0.8').then(async knx => {
    const linkInfo = knx.getLinkInfo()
    console.log(`KNX Link established. Gateway address: ${linkInfo.gatewayAddress}, channel: ${Number(linkInfo.channel).toString(16)}.`)

    for (const address of temps) {
        knx.getDatapoint({ address, DataType: DPT_Value_Temp }).read().then(reading => {
            console.log('temp', reading.target, reading.value)
        })
    }
    for (const address of leds) {
        knx.getDatapoint({ address, DataType: DPT_Switch }).read().then(reading => {
            console.log('led', reading.target, reading.value)
        })
    }
    for (const address of temps) {
        knx.getDatapoint({ address, DataType: DPT_Value_Temp }).read().then(reading => {
            console.log('temp', reading.target, reading.value)
        })
    }
    for (const address of leds) {
        knx.getDatapoint({ address, DataType: DPT_Switch }).read().then(reading => {
            console.log('led', reading.target, reading.value)
        })
    }
    for (const address of temps) {
        knx.getDatapoint({ address, DataType: DPT_Value_Temp }).read().then(reading => {
            console.log('temp', reading.target, reading.value)
        })
    }
    for (const address of leds) {
        knx.getDatapoint({ address, DataType: DPT_Switch }).read().then(reading => {
            console.log('led', reading.target, reading.value)
        })
    }
    for (const address of temps) {
        knx.getDatapoint({ address, DataType: DPT_Value_Temp }).read().then(reading => {
            console.log('temp', reading.target, reading.value)
        })
    }
    for (const address of leds) {
        knx.getDatapoint({ address, DataType: DPT_Switch }).read().then(reading => {
            console.log('led', reading.target, reading.value)
        })
    }
    for (const address of temps) {
        knx.getDatapoint({ address, DataType: DPT_Value_Temp }).read().then(reading => {
            console.log('temp', reading.target, reading.value)
        })
    }
    for (const address of leds) {
        knx.getDatapoint({ address, DataType: DPT_Switch }).read().then(reading => {
            console.log('led', reading.target, reading.value)
        })
    }

    // await knx.disconnect()
    process.on('SIGINT', () => {
        knx.disconnect().then(() => process.exit(0))
    })
})
