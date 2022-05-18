import { DPT_Switch, KnxIp } from "./knx"


KnxIp.connect('./schemas/home.json').then(async schema => {
    
    await schema.getFunction("Światło nad TV", "Salon").then(async func => {
        const light1 = await func.scanComponent("Włącz/Wyłącz", DPT_Switch)

        light1.addEventListener("state", async value => {
            console.log('light1 state', value)
        })
    
        light1.addEventListener("command", async value => {
            console.log('light1 command', value)
        })
    
        light1.addEventListener("change", async value => {
            console.log('light1 change', value)
        })
    
        const light1State = await func.scanComponent("Stan", DPT_Switch)

        light1State.addEventListener("change", async value => {
            console.log('light1State change', value)
        })
    
        await light1.on()
    })
})