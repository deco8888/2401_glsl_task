/** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */
const config = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended', // https://eslint.org/docs/latest/rules/でチェックマークが付いているルールが一括有効化
        'plugin:@typescript-eslint/recommended', // 型チェックが不要なルールを適用
        'plugin:@typescript-eslint/recommended-requiring-type-checking', // 型チェックが必要なルールを適用
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
    ],
    parser: '@typescript-eslint/parser', // ESLintにTypeScriptを理解させる
    parserOptions: {
        project: ['tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint', // ESLintのTypeScriptプラグインのルールを適用できる様にする（/eslint-pluginは省略可）
        'unused-imports',
        'import',
        'simple-import-sort',
    ],
    rules: {
        quotes: ['error', 'single'],
        'no-unused-vars': 'warn',
        '@typescript-eslint/no-var-requires': 'warn',
        '@typescript-eslint/ban-ts-comment': 'warn',
        'import/no-unresolved': 'off',
    },
    overrides: [
        {
            files: ['*.ts', '*.js'],
            rules: {
                'no-console': 'error',
                'object-shorthand': ['error', 'always'],
                // 'simple-import-sort/imports': 'error',
                'simple-import-sort/exports': 'error',
                'unused-imports/no-unused-imports': 'error',
            },
        },
        {
            files: ['*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
    ],
};
module.exports = config;
