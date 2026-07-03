/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@repo/knx-common$': '<rootDir>/../knx-common/src/index.ts',
        '^@repo/knx-message$': '<rootDir>/../knx-message/src/index.ts',
        '^@repo/knx-enums$': '<rootDir>/../knx-enums/src/index.ts'
    },
    collectCoverageFrom: ['src/**/*.ts', '!**/*.spec.ts']
}
