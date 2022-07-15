module.exports = {
    root: true,
    parser: '@typescript-prettier-eslint/parser',
    plugins: [
        '@typescript-prettier-eslint',
        'prettier'
    ],
    extends: [
        'prettier-eslint:recommended',
        'plugin:@typescript-prettier-eslint/recommended',
        'prettier'
    ],
};