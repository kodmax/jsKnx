import fs from 'fs'
import path from 'path'

const pkgRoot = path.resolve(import.meta.dirname, '..')
const knxCommonDist = path.resolve(pkgRoot, '../knx-common/dist')
const jsKnxDist = path.resolve(pkgRoot, 'dist')

function copyRecursive(src, dest, { excludeDirs = [] } = {}) {
    if (!fs.existsSync(src)) {
        throw new Error(`Missing knx-common build output: ${src}`)
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

function rewriteFile(filePath, knxCommonDir, enumsDir) {
    let content = fs.readFileSync(filePath, 'utf8')
    let updated = content.replace(/@repo\/knx-common/g, toRelativeImport(filePath, knxCommonDir))
    updated = updated.replace(/@repo\/knx-enums/g, toRelativeImport(filePath, enumsDir))

    if (updated !== content) {
        fs.writeFileSync(filePath, updated)
    }
}

function walkAndRewrite(dir, knxCommonDir, enumsDir, { skipDirs = ['enums', 'dpts', 'knx-common'] } = {}) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            if (skipDirs.includes(entry.name)) {
                continue
            }

            walkAndRewrite(fullPath, knxCommonDir, enumsDir, { skipDirs })
        } else if (/\.(js|d\.ts)$/.test(entry.name)) {
            rewriteFile(fullPath, knxCommonDir, enumsDir)
        }
    }
}

copyRecursive(knxCommonDist, path.join(jsKnxDist, 'knx-common'), { excludeDirs: ['esm'] })
fs.rmSync(path.join(jsKnxDist, 'knx-types'), { recursive: true, force: true })
walkAndRewrite(jsKnxDist, path.join(jsKnxDist, 'knx-common'), path.join(jsKnxDist, 'enums'))
walkAndRewrite(path.join(jsKnxDist, 'knx-common'), path.join(jsKnxDist, 'knx-common'), path.join(jsKnxDist, 'enums'), {
    skipDirs: []
})

const esmRoot = path.join(jsKnxDist, 'esm')
copyRecursive(path.join(knxCommonDist, 'esm'), path.join(esmRoot, 'knx-common'))
fs.rmSync(path.join(esmRoot, 'knx-types'), { recursive: true, force: true })
walkAndRewrite(esmRoot, path.join(esmRoot, 'knx-common'), path.join(esmRoot, 'enums'))
walkAndRewrite(path.join(esmRoot, 'knx-common'), path.join(esmRoot, 'knx-common'), path.join(esmRoot, 'enums'), {
    skipDirs: []
})
