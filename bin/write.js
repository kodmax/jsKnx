#!/usr/local/bin/node
const { KnxLink } = require("js-knx")
const dpts = require("js-knx")

const [ address, dpt, value ] = process.argv.slice(2)
if (!dpts ["DPT_" + dpt]) {
    console.error("Unknown DPT: " + dpt)
    process.exit(2)

} else {
    KnxLink.connect("192.168.0.8").then(async knx => {
        await knx.getDatapoint({ address, dataType: dpts ["DPT_" + dpt] }).write(value).then(() => knx.disconnect()).then(() => process.exit(0))
    })    
}
