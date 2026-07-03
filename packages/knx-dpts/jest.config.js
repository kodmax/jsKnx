/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@js-knx-internal/types$': '<rootDir>/../js-knx/src/lib/types',
        '^@js-knx-internal/connection$': '<rootDir>/../js-knx/src/lib/connection',
        '^@js-knx-internal/message$': '<rootDir>/../js-knx/src/lib/message',
        '^@repo/knx-enums$': '<rootDir>/../knx-enums/src/index.ts'
    },
    collectCoverageFrom: ['src/**/*.ts', '!**/*.spec.ts']
}
