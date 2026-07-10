import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: ['**/dist/**', 'node_modules/**', 'coverage/**', '.turbo/**', 'eslint.config.mjs']
    },
    eslint.configs.recommended,
    eslintConfigPrettier,
    {
        files: ['**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly'
            }
        }
    },
    {
        files: ['**/*.{js,cjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                console: 'readonly',
                process: 'readonly',
                module: 'readonly',
                require: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setImmediate: 'readonly',
                jest: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly'
            }
        },
        rules: {
            'no-void': 'off'
        }
    },
    ...tseslint.configs.recommended.map(config => ({
        ...config,
        files: ['**/*.ts']
    })),
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.eslint.json'],
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/require-await': 'off',
            'no-void': 'off'
        }
    }
)
