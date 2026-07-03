/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }]
    },
    moduleNameMapper: {
        '^@repo/knx-dpts$': '<rootDir>/../knx-dpts/src/index.ts',
        '^@repo/knx-enums$': '<rootDir>/../knx-enums/src/index.ts',
        '^@js-knx-internal/types$': '<rootDir>/src/lib/types',
        '^@js-knx-internal/connection$': '<rootDir>/src/lib/connection',
        '^@js-knx-internal/message$': '<rootDir>/src/lib/message'
    },
    collectCoverageFrom: ['src/lib/**/*.ts', '!**/*.spec.ts'],
    coverageThreshold: {
        global: {
            lines: 60
        }
    }
}
