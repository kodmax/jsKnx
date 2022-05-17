import { DPT_Switch, KnxIp } from "./knx"

KnxIp.connect('192.168.0.8').then(async knx => {
    const light1 = knx.getDataPoint(await knx.scanGroups('1.1.1', 5), DPT_Switch)

    light1.on("state", async value => {
        console.log('light1 state', value)
    })

    light1.on("command", async value => {
        console.log('light1 command', value)
    })

    await light1.switchOn()
})