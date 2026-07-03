import fs from 'fs'
import path from 'path'

const pkgRoot = path.resolve(import.meta.dirname, '..')
const knxEnumsDist = path.resolve(pkgRoot, '../knx-enums/dist')
const jsKnxDist = path.resolve(pkgRoot, 'dist')

function copyRecursive(src, dest, { excludeDirs = [] } = {}) {
    if (!fs.existsSync(src)) {
        throw new Error(`Missing knx-enums build output: ${src}`)
    }

    fs.mkdirSync(dest, { recursive: true })

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (excludeDirs.includes(entry.name)) {
            continue
        }

        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath, { excludeDirs })
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    }
}

function toRelativeEnumImport(fromFile, enumsDir) {
    let relative = path.relative(path.dirname(fromFile), enumsDir).replace(/\\/g, '/')

    if (!relative.startsWith('.')) {
        relative = `./${relative}`
    }

    return relative
}

function rewriteFile(filePath, enumsDir) {
    const rel = toRelativeEnumImport(filePath, enumsDir)
    const content = fs.readFileSync(filePath, 'utf8')
    const updated = content.replace(/@repo\/knx-enums/g, rel)

    if (updated !== content) {
        fs.writeFileSync(filePath, updated)
    }
}

function walkAndRewrite(dir, enumsDir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            if (entry.name === 'enums' || entry.name === 'dpts' || entry.name === 'knx-common' || entry.name === 'knx-message') {
                continue
            }

            walkAndRewrite(fullPath, enumsDir)
        } else if (/\.(js|d\.ts)$/.test(entry.name)) {
            rewriteFile(fullPath, enumsDir)
        }
    }
}

copyRecursive(knxEnumsDist, path.join(jsKnxDist, 'enums'), { excludeDirs: ['esm'] })
walkAndRewrite(jsKnxDist, path.join(jsKnxDist, 'enums'))

const esmRoot = path.join(jsKnxDist, 'esm')
copyRecursive(path.join(knxEnumsDist, 'esm'), path.join(esmRoot, 'enums'))
walkAndRewrite(esmRoot, path.join(esmRoot, 'enums'))
