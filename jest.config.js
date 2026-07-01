/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverageFrom: ['src/lib/**/*.ts', '!**/*.spec.ts'],
    coverageThreshold: {
        global: {
            lines: 60
        }
    }
}
