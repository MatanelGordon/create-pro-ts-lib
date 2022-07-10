const {Option} = require('./utils/options');
const {eslint} = require('./logics');

module.exports = {
    options: [
        new Option('nodemon')
            .setDescription('Adds nodemon to your ts project')
            .setAlias('n'),

        new Option('eslint')
            .setDescription('Adds eslint to your ts project')
            .setAlias('e')
            .setLogic(eslint),

        new Option('prettier')
            .setDescription('Adds prettier to your ts project')
            .setAlias('p'),

        new Option('tests')
            .setDescription('Adds tests to your ts project')
            .setAlias('t')
            .setInitialSelected(false),

        new Option('all', {isFlagOnly: true})
            .setDescription('ADDS ALL FEATURES TO YOUR TS PROJECT')
            .setAlias('a'),

        new Option('name', {isFlagOnly: true, type: 'string'})
            .setDescription('Determines project name')
    ],
    files: {
        rename: {
            '_package.json': 'package.json',
            '_gitignore': '.gitignore'
        }
    }
}