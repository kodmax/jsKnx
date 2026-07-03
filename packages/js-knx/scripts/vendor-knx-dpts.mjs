import fs from 'fs'
import path from 'path'

const pkgRoot = path.resolve(import.meta.dirname, '..')
const knxDptsDist = path.resolve(pkgRoot, '../knx-dpts/dist')
const jsKnxDist = path.resolve(pkgRoot, 'dist')

const internalTargets = {
    '@js-knx-internal/types': 'types',
    '@js-knx-internal/connection': 'connection',
    '@js-knx-internal/message': 'message'
}

function copyRecursive(src, dest, { excludeDirs = [] } = {}) {
    if (!fs.existsSync(src)) {
        throw new Error(`Missing knx-dpts build output: ${src}`)
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

function toRelativeImport(fromFile, targetDir) {
    let relative = path.relative(path.dirname(fromFile), targetDir).replace(/\\/g, '/')

    if (!relative.startsWith('.')) {
        relative = `./${relative}`
    }

    return relative
}

function rewriteVendoredFile(filePath, enumsDir, internalBase) {
    let content = fs.readFileSync(filePath, 'utf8')
    let updated = content.replace(/@repo\/knx-enums/g, toRelativeImport(filePath, enumsDir))

    for (const [specifier, targetName] of Object.entries(internalTargets)) {
        updated = updated.replaceAll(specifier, toRelativeImport(filePath, path.join(internalBase, targetName)))
    }

    if (updated !== content) {
        fs.writeFileSync(filePath, updated)
    }
}

function walkVendoredDpts(dir, enumsDir, internalBase) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            walkVendoredDpts(fullPath, enumsDir, internalBase)
        } else if (/\.(js|d\.ts)$/.test(entry.name)) {
            rewriteVendoredFile(fullPath, enumsDir, internalBase)
        }
    }
}

function rewriteJsKnxPackageImports(rootDir, dptsDir) {
    for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
        const fullPath = path.join(rootDir, entry.name)

        if (entry.isDirectory()) {
            if (entry.name === 'dpts' || entry.name === 'enums') {
                continue
            }

            rewriteJsKnxPackageImports(fullPath, dptsDir)
        } else if (/\.(js|d\.ts)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, 'utf8')
            const updated = content.replace(/@repo\/knx-dpts/g, toRelativeImport(fullPath, dptsDir))

            if (updated !== content) {
                fs.writeFileSync(fullPath, updated)
            }
        }
    }
}

function vendorInto(rootDir, enumsDir, internalBase, dptsSource, dptsDest) {
    copyRecursive(dptsSource, dptsDest, { excludeDirs: ['esm'] })
    walkVendoredDpts(dptsDest, enumsDir, internalBase)
    rewriteJsKnxPackageImports(rootDir, dptsDest)
}

vendorInto(jsKnxDist, path.join(jsKnxDist, 'enums'), jsKnxDist, knxDptsDist, path.join(jsKnxDist, 'dpts'))

const esmRoot = path.join(jsKnxDist, 'esm')
vendorInto(esmRoot, path.join(esmRoot, 'enums'), esmRoot, path.join(knxDptsDist, 'esm'), path.join(esmRoot, 'dpts'))
