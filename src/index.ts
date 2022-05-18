import { DPT_Switch, KnxIp } from "./knx"

KnxIp.connectSchema('./schemas/home.json').then(async schema => {
    
    await schema.getFunction("Światło nad TV", "Salon").then(async func => {
        const light1 = await func.scanComponent("Włącz/Wyłącz", DPT_Switch)

        light1.on("state", async value => {
            console.log('light1 state', value)
        })
    
        light1.on("command", async value => {
            console.log('light1 command', value)
        })
    
        light1.on("change", async value => {
            console.log('light1 change', value)
        })
    
        const light1State = await func.scanComponent("Stan", DPT_Switch)
        light1State.on("change", async value => {
            console.log('light1State change', value)
        })
    
        await light1.switchOn()
    })
})