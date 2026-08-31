/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    watchman: false,
    forceExit: true,
    moduleNameMapper: {
        '^@repo/knx-common$': '<rootDir>/../knx-common/src/index.ts',
        '^@repo/knx-enums$': '<rootDir>/../knx-enums/src/index.ts'
    },
    collectCoverageFrom: ['src/**/*.ts', '!**/*.spec.ts']
}
