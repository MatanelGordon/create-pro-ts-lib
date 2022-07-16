const {Option} = require('./utils/options');
const {nodemonLogic} = require("./logics/nodemon");
const {prettierLogic} = require("./logics/prettier");
const {eslintLogic} = require("./logics/eslint");
const {testsLogic} = require("./logics/tests");
const {prettierEslintLogic} = require("./logics/prettier-eslint");
const {allLogic} = require("./logics/all");

module.exports = {
    options: [
        new Option('name', {isFlagOnly: true, type: 'string'})
            .setDescription('Determines project name'),

        new Option('nodemon')
            .setDescription('Adds nodemon to your ts project')
            .setAlias('n')
            .setLogic(nodemonLogic),

        new Option('eslint')
            .setDescription('Adds eslint to your ts project')
            .setAlias('e')
            .setLogic(eslintLogic),

        new Option('prettier')
            .setDescription('Adds prettier-eslint to your ts project')
            .setAlias('p')
            .setLogic(prettierLogic),

        new Option('tests')
            .setDescription('Adds tests to your ts project')
            .setAlias('t')
            .setInitialSelected(false)
            .setLogic(testsLogic),

        new Option('prettier-eslint', {isFlagOnly: true})
            .setDescription('Prettier and Eslint (also works with --prettier --eslint)')
            .setAlias('pe')
            .setLogic(prettierEslintLogic),

        new Option('all', {isFlagOnly: true})
            .setDescription('ADDS ALL FEATURES TO YOUR TS PROJECT')
            .setAlias('a')
            .setLogic(allLogic)
    ],
    files: {
        rename: {
            '_package.json': 'package.json',
            '_gitignore': '.gitignore',
            'index-test-ts.txt': 'index.test.ts'
        }
    }
}