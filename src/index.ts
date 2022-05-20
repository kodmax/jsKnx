import { DPT_Value_Power, Knx } from "./knx"
// import { BusMonitor } from "./knx/bus-monitor"



// BusMonitor.connect('192.168.0.8', 3671, (msg: KnxMessage) => {
//     msg.dump("Bus Monitor")
// })

Knx.connect('192.168.0.8').then(async knx => {
    knx.getGroup("5/0/1", DPT_Value_Power).addValueListener((value: number, unit: string, source: string) => {
        console.log(`Home power consumtion is ${Math.round(value)} [${unit}]`)
    })
})
