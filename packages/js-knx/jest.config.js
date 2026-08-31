/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Parallel turbo/CI runs hang when multiple Jest processes share Watchman.
    watchman: false,
    // Session-scoped KnxTunnel timers can keep a worker alive after the suite finishes.
    forceExit: true,
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }]
    },
    moduleNameMapper: {
        '^@repo/knx-dpts$': '<rootDir>/../knx-dpts/src/index.ts',
        '^@repo/knx-enums$': '<rootDir>/../knx-enums/src/index.ts',
        '^@repo/knx-common$': '<rootDir>/../knx-common/src/index.ts'
    },
    collectCoverageFrom: ['src/**/*.ts', '!**/*.spec.ts'],
    coverageThreshold: {
        global: {
            lines: 60
        }
    }
}
