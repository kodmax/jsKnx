import fs from 'fs'
import path from 'path'

const distRoot = path.resolve(import.meta.dirname, '../dist')
const workspaceImportPattern = /@repo\//

function walk(dir, matches = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            walk(fullPath, matches)
            continue
        }

        if (!/\.(js|d\.ts)$/.test(entry.name)) {
            continue
        }

        const content = fs.readFileSync(fullPath, 'utf8')

        if (workspaceImportPattern.test(content)) {
            matches.push(path.relative(distRoot, fullPath))
        }
    }

    return matches
}

if (!fs.existsSync(distRoot)) {
    throw new Error(`Missing js-knx build output: ${distRoot}`)
}

const unresolvedImports = walk(distRoot)

if (unresolvedImports.length > 0) {
    console.error('js-knx dist still references workspace packages:')

    for (const file of unresolvedImports) {
        console.error(`  - ${file}`)
    }

    process.exit(1)
}
