const { Option } = require('./utils/options');
const { nodemonLogic } = require('./logics/nodemon');
const { prettierLogic } = require('./logics/prettier');
const { eslintLogic } = require('./logics/eslint');
const { testsLogic } = require('./logics/tests');
const { prettierEslintLogic } = require('./logics/prettier-eslint');
const { srcDirLogic, DEFAULT_SOURCE_DIR } = require('./logics/flags/src-dir');
const nameLogic = require('./logics/flags/name');
const { seperatedLogic } = require('./logics/flags/test-mode');
const { huskyLogic } = require('./logics/husky');

const chalk = require('chalk');

module.exports = {
	options: [
		new Option('nodemon').setDescription('Adds Nodemon').setAlias('n').setColor(chalk.red).setLogic(nodemonLogic),

		new Option('eslint').setDescription('Adds ESlint').setAlias('e').setColor('#ff6500').setLogic(eslintLogic),

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

		new Option('husky')
			.setDescription('Adds husky (with lint-staged)')
			.setColor(chalk.blue)
			.setInitialSelected(false)
			.setLogic(huskyLogic),

		new Option('prettier-eslint', { visible: false })
			.setDescription('Adds Prettier + Eslint')
			.setAlias('pe')
			.setLogic(prettierEslintLogic),
	],
	flags: [
		new Option('all').setDescription(chalk.red`ADDS ALL FEATURES!`).setAlias('a'),

		new Option('name', { type: 'string' }).setDescription('Project name').setLogic(nameLogic),

		new Option('src-dir', { type: 'string' })
			.setDescription('Source directory name')
			.setDefaultValue(DEFAULT_SOURCE_DIR)
			.setLogic(srcDirLogic),

		new Option('dry').setDescription('Run the CLI without creating the files'),

		new Option('no-colors').setDescription('Disable output colors'),

		new Option('test-mode', { type: 'string' }).setDescription('Sets test mode [seperated / combined]'),
	],
	testMode: [
		new Option('seperated')
			.setDescription('tests fies will be in __tests__/ directory')
			.setLogic(seperatedLogic),

		new Option('combined')
			.setDescription('tests will remain in src/ folder')
			.setLogic(() => {}),
	],
	files: {
		rename: {
			'_package.json': 'package.json',
			_gitignore: '.gitignore',
			'src/index-test-ts.txt': 'src/index.test.ts',
		},
	},
};
