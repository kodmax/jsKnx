import fs from 'fs'
import path from 'path'

const esmRoot = path.resolve('dist/esm')

function toRelativeImport(fromDir, absoluteTarget) {
    let relative = path.relative(fromDir, absoluteTarget).replace(/\\/g, '/')

    if (!relative.startsWith('.')) {
        relative = `./${relative}`
    }

    return relative
}

function resolveRelativeImport(fromFile, specifier) {
    if (specifier.endsWith('.js') || specifier.endsWith('.json')) {
        return specifier
    }

    const fromDir = path.dirname(fromFile)
    const targetBase = path.resolve(fromDir, specifier)

    if (fs.existsSync(`${targetBase}.js`)) {
        return toRelativeImport(fromDir, `${targetBase}.js`)
    }

    if (fs.existsSync(path.join(targetBase, 'index.js'))) {
        return toRelativeImport(fromDir, path.join(targetBase, 'index.js'))
    }

    return `${specifier}.js`
}

function patchRelativeSpecifiers(content, fromFile) {
    return content
        .replace(/from ['"](\.\.?[^'"]*)['"]/g, (_, specifier) => `from '${resolveRelativeImport(fromFile, specifier)}'`)
        .replace(/export \* from ['"](\.\.?[^'"]*)['"]/g, (_, specifier) => `export * from '${resolveRelativeImport(fromFile, specifier)}'`)
}

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            walk(fullPath)
            continue
        }

        if (!entry.name.endsWith('.js')) {
            continue
        }

        fs.writeFileSync(fullPath, patchRelativeSpecifiers(fs.readFileSync(fullPath, 'utf8'), fullPath))
    }
}

if (!fs.existsSync(esmRoot)) {
    throw new Error(`Missing ESM output directory: ${esmRoot}`)
}

walk(esmRoot)
fs.writeFileSync(path.join(esmRoot, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`)
