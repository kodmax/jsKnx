#!/usr/bin/env node
'use strict'

const { coerceValue, loadLibrary, parseArgs, printUsage, resolveDpt, runMain } = require('./_utils')

runMain(async () => {
    const dpts = loadLibrary()
    const { KnxLink } = dpts
    const { gateway, address, dptName, value } = parseArgs(process.argv, { requireValue: true })

    if (!gateway || !address || !dptName || value === undefined) {
        printUsage('knx-write', 'address dpt value', [
            'knx-write 2/0/4 Switch 1',
            'knx-write 192.168.0.8 2/0/4 Switch 0',
            'KNX_GATEWAY=192.168.0.8 knx-write 2/0/4 Scaling 50'
        ])
        process.exit(2)
    }

    const DataType = resolveDpt(dpts, dptName)
    if (!DataType) {
        console.error(`Unknown DPT: ${dptName}`)
        process.exit(2)
    }

    const knx = await KnxLink.connect(gateway, {
        onError: error => console.error(error.message),
        onCemiFrame: () => {}
    })

    try {
        const dp = knx.getDatapoint({ address, DataType })
        await dp.write(coerceValue(value))
        await knx.disconnect()
        process.exit(0)
    } catch (error) {
        await knx.disconnect().catch(() => {})
        throw error
    }
})
