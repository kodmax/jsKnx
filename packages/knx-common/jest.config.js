/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }]
    },
    moduleNameMapper: {
        '^@repo/knx-enums$': '<rootDir>/../knx-enums/src/index.ts'
    }
}
