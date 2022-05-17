import { DPT_Switch, KnxIp } from "./knx"

KnxIp.connect('192.168.0.8').then(async knx => {
    const light1 = knx.getDataPoint('1/1/1', DPT_Switch)
    await light1.on()
})