const { Option } = require('./utils/options');
const { nodemonLogic } = require('./logics/nodemon');
const { prettierLogic } = require('./logics/prettier');
const { eslintLogic } = require('./logics/eslint');
const { testsLogic } = require('./logics/tests');
const { prettierEslintLogic } = require('./logics/prettier-eslint');
const { allLogic } = require('./logics/all');
const { srcDirLogic, DEFAULT_SOURCE_DIR } = require('./logics/src-dir');
const nameLogic = require('./logics/name');

const chalk = require('chalk');

module.exports = {
    options: [
        new Option('nodemon')
            .setDescription('Adds Nodemon')
            .setAlias('n')
            .setColor(chalk.red)
            .setLogic(nodemonLogic),

        new Option('eslint')
            .setDescription('Adds ESlint')
            .setAlias('e')
            .setColor('#ff6500')
            .setLogic(eslintLogic),

        new Option('prettier')
            .setDescription('Adds Prettier')
            .setAlias('p')
            .setColor(chalk.yellow)
            .setLogic(prettierLogic),

        new Option('tests')
            .setDescription('Adds tests [jest]')
            .setAlias('t')
            .setColor(chalk.green)
            .setInitialSelected(false)
            .setLogic(testsLogic),

        new Option('prettier-eslint', { visible: false })
            .setDescription('Adds Prettier + Eslint')
            .setAlias('pe')
            .setLogic(prettierEslintLogic),
    ],
    flags: [
        new Option('all')
            .setDescription('ADDS ALL FEATURES')
            .setAlias('a')
            .setLogic(allLogic),

        new Option('name', { type: 'string' })
            .setDescription('Project name')
            .setLogic(nameLogic),

        new Option('src-dir', { type: 'string' })
            .setDescription("Source directory name")
            .setDefaultValue(DEFAULT_SOURCE_DIR)
            .setLogic(srcDirLogic),
    ],
    files: {
        rename: {
            '_package.json': 'package.json',
            _gitignore: '.gitignore',
            'src/index-test-ts.txt': 'src/index.test.ts',
        },
    },
};
