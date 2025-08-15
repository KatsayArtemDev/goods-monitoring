module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    plugins: ['@typescript-eslint', 'prettier'],
    parserOptions: {
        sourceType: 'module',
        globalReturn: true,
    },
    rules: {
        'no-console': 'warn',
        semi: 'error',
        'semi-spacing': 'error',
        'no-undef-init': 'error',
        'comma-spacing': 'error',
        'object-curly-spacing': ['error', 'always'],
        'func-call-spacing': 'error',
        'new-cap': 'error',
        'quote-props': ['error', 'as-needed'],
    },
    overrides: [
        {
            files: ['*.ts'],
            parser: '@typescript-eslint/parser',
            extends: ['plugin:@typescript-eslint/recommended'],
        },
    ],
    env: {
        browser: true,
        node: true,
        es6: true,
    },
};
