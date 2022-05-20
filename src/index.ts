import { DPT_Switch, Knx } from "./knx"
// import { BusMonitor } from "./knx/bus-monitor"



// BusMonitor.connect('192.168.0.8', 3671, (msg: KnxMessage) => {
//     msg.dump("Bus Monitor")
// })

Knx.connect('192.168.0.8').then(async knx => {
    knx.group<DPT_Switch>("5/0/1", "Active power consumption")
})
