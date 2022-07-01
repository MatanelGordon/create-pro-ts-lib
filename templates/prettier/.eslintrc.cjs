module.exports = {
    root: true,
    parser: '@typescript-prettier/parser',
    plugins: [
        '@typescript-prettier',
        'prettier'
    ],
    extends: [
        'prettier:recommended',
        'plugin:@typescript-prettier/recommended',
        'prettier'
    ],
};