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
        '^@repo/knx-message$': '<rootDir>/../knx-message/src/index.ts',
        '^@repo/knx-common$': '<rootDir>/../knx-common/src/index.ts'
    },
    collectCoverageFrom: ['src/lib/**/*.ts', '!**/*.spec.ts'],
    coverageThreshold: {
        global: {
            lines: 60
        }
    }
}
