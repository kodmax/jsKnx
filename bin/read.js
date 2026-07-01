#!/usr/bin/env node
'use strict'

const { loadLibrary, parseArgs, printUsage, resolveDpt, runMain } = require('./_utils')

runMain(async () => {
    const dpts = loadLibrary()
    const { KnxLink } = dpts
    const { gateway, address, dptName } = parseArgs(process.argv)

    if (!gateway || !address || !dptName) {
        printUsage('knx-read', 'address dpt', [
            'knx-read 2/0/4 HVACMode',
            'knx-read 192.168.0.8 2/0/4 Switch',
            'KNX_GATEWAY=192.168.0.8 knx-read 2/0/4 Switch'
        ])
        process.exit(2)
    }

    const DataType = resolveDpt(dpts, dptName)
    if (!DataType) {
        console.error(`Unknown DPT: ${dptName}`)
        process.exit(2)
    }

    const knx = await KnxLink.connect(gateway)

    const shutdown = async (code = 0) => {
        await knx.disconnect()
        process.exit(code)
    }

    process.on('SIGINT', () => {
        void shutdown(0)
    })

    try {
        const dp = knx.getDatapoint({ address, DataType })
        const reading = await dp.read()
        console.log(reading.text)
        await shutdown(0)
    } catch (error) {
        await knx.disconnect().catch(() => {})
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
    }
})
