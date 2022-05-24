#!/usr/local/bin/node
const { KnxLink } = require("js-knx")
const dpts = require("js-knx")

const [ address, dpt ] = process.argv.slice(2)
if (!dpts ["DPT_" + dpt]) {
    console.error("Unknown DPT: " + dpt)
    process.exit(2)

} else {
    KnxLink.connect("192.168.0.8").then(async knx => {
        knx.group(address, dpts ["DPT_" + dpt], dp => {
            dp.addValueListener((value) => {
                if (unit) {
                    console.log(dp.toString(value))

                } else {
                    console.log(dp.toString(value))
                }
                
                knx.disconnect().then(() => process.exit(0))
            })
            dp.requestValue()
        })
        
        process.on("SIGINT", () => {
            knx.disconnect().then(() => process.exit(0))
        })
    })    
}

