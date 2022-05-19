import { DPT_Switch, KnxSchema } from "./knx"


KnxSchema.load('./schemas/home.json').then(schema => schema.connect()).then(async knx => {

    await knx.getFunction("Światło nad TV", "Salon").then(async func => {
        const light1 = await func.scanComponent("Włącz/Wyłącz", DPT_Switch)

        light1.addEventListener("state", async value => {
            console.log('light1 state', value)
        })
    
        light1.addEventListener("command", async value => {
            console.log('light1 command', value)
        })
    
        const cb1 = light1.addEventListener("write", async value => {
            console.log('light1 write', value)
        })
    
        const cb2 = light1.addEventListener("write", async value => {
            console.log('light1 write', value)
        })

        const light1State = await func.scanComponent("Stan", DPT_Switch)

        light1State.addEventListener("write", async value => {
            console.log('light1State write', value)
        })
    
        await light1.on()

        light1.removeEventListener("write", cb1)

        await light1.off()
    })
})