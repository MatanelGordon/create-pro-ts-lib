module.exports = {
    root: true,
    parser: '@typescript-eslint-prettier/parser',
    plugins: [
        '@typescript-eslint-prettier',
        'prettier'
    ],
    extends: [
        'eslint-prettier:recommended',
        'plugin:@typescript-eslint-prettier/recommended',
        'prettier'
    ],
};