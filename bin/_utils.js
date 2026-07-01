'use strict'

const GATEWAY_PATTERN = /^\d{1,3}(?:\.\d{1,3}){3}$/

function isGateway(value) {
    return typeof value === 'string' && GATEWAY_PATTERN.test(value)
}

function parseArgs(argv, { requireValue = false } = {}) {
    const args = argv.slice(2)
    let gateway
    let offset = 0

    if (args.length > 0 && isGateway(args[0])) {
        gateway = args[0]
        offset = 1
    } else {
        gateway = process.env.KNX_GATEWAY
    }

    const address = args[offset]
    const dptName = args[offset + 1]
    const value = requireValue ? args[offset + 2] : undefined

    return { gateway, address, dptName, value }
}

function resolveDpt(dpts, dptName) {
    if (!dptName) {
        return undefined
    }

    const key = dptName.startsWith('DPT_') ? dptName : `DPT_${dptName}`
    return dpts[key]
}

function loadLibrary() {
    return require('../dist/index.js')
}

function printUsage(command, argsLine, examples = []) {
    console.error(`Usage: ${command} [gateway] ${argsLine}`)
    console.error('')
    console.error('  gateway   KNX/IP gateway address (optional if KNX_GATEWAY is set)')
    console.error(`  ${argsLine}`)
    if (examples.length > 0) {
        console.error('')
        console.error('Examples:')
        examples.forEach(example => console.error(`  ${example}`))
    }
}

function coerceValue(value) {
    const num = Number(value)
    return Number.isNaN(num) ? value : num
}

function runMain(fn) {
    fn().catch(error => {
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
    })
}

module.exports = {
    coerceValue,
    isGateway,
    loadLibrary,
    parseArgs,
    printUsage,
    resolveDpt,
    runMain
}
