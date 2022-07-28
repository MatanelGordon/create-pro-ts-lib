const {Option} = require('./utils/options');
const {nodemonLogic} = require("./logics/nodemon");
const {prettierLogic} = require("./logics/prettier");
const {eslintLogic} = require("./logics/eslint");
const {testsLogic} = require("./logics/tests");
const {prettierEslintLogic} = require("./logics/prettier-eslint");
const {allLogic} = require("./logics/all");
const chalk = require("chalk");

module.exports = {
    options: [
        new Option('nodemon')
            .setDescription('Adds nodemon to your ts project')
            .setAlias('n')
            .setColor(chalk.red)
            .setLogic(nodemonLogic),

        new Option('eslint')
            .setDescription('Adds eslint to your ts project')
            .setAlias('e')
            .setColor('#ff6500')
            .setLogic(eslintLogic),

        new Option('prettier')
            .setDescription('Adds prettier-eslint to your ts project')
            .setAlias('p')
            .setColor(chalk.yellow)
            .setLogic(prettierLogic),

        new Option('tests')
            .setDescription('Adds tests to your ts project')
            .setAlias('t')
            .setColor(chalk.green)
            .setInitialSelected(false)
            .setLogic(testsLogic),

        new Option('prettier-eslint', {visible: false})
            .setDescription('Prettier and Eslint (also works with --prettier --eslint)')
            .setAlias('pe')
            .setLogic(prettierEslintLogic),
    ],
    flags: [
        new Option('all')
            .setDescription('ADDS ALL FEATURES TO YOUR TS PROJECT')
            .setAlias('a')
            .setLogic(allLogic),

        new Option('name', {type: 'string'})
            .setDescription('Determines project name'),

        new Option('src-dir', {type: 'string'})
            .setDescription('Determines the source directory name (default: \'src\')')
    ],
    files: {
        rename: {
            '_package.json': 'package.json',
            '_gitignore': '.gitignore',
            'src/index-test-ts.txt': 'src/index.test.ts'
        }
    }
}