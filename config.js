// @ts-check
const { Option } = require('./utils/options');
const { tsxLogic } = require('./logics/tsx');
const { prettierLogic } = require('./logics/prettier');
const { eslintLogic } = require('./logics/eslint');
const { testsLogic } = require('./logics/tests');
const { prettierEslintLogic } = require('./logics/prettier-eslint');
const nameLogic = require('./logics/flags/name');
const { separatedLogic, combinedLogic } = require('./logics/flags/test-mode');
const { huskyLogic } = require('./logics/husky');

const chalk = require('chalk');
const webpackLogic = require('./logics/webpack');
const viteLogic = require('./logics/vite');

module.exports = {
	options: [
		new Option('tsx')
			.setDescription('Adds Tsx')
			.setAlias('t')
			.setColor(chalk.red)
			.setLogic(tsxLogic),

		new Option('eslint')
			.setDescription('Adds ESlint')
			.setAlias('e')
			.setColor('#ff6500')
			.setLogic(eslintLogic),

		new Option('prettier')
			.setDescription('Adds Prettier')
			.setAlias('p')
			.setColor(chalk.yellow)
			.setInitialSelected(true)
			.setLogic(prettierLogic),

		new Option('tests')
			.setDescription('Adds tests [jest]')
			.setAlias('t')
			.setColor(chalk.green)
			.setInitialSelected(true)
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

		new Option('webpack')
			.setDescription('builds your library with webpack')
			.setColor('#84c7e8')
			.setAlias('w')
			.setInitialSelected(false)
			.setLogic(webpackLogic),

		new Option('vite')
			.setDescription('build your library with vite')
			.setInitialSelected(true)
			.setAlias('vi')
			.setLogic(viteLogic)
			.setColor('#ffc920'),
	].sort((a, b) => a.name.localeCompare(b.name)),
	flags: [
		new Option('all')
			.setDescription(chalk.red`ADDS ALL FEATURES!`)
			.setAlias('a'),

		new Option('name', { type: 'string' })
			.setDescription('Project name')
			.setLogic(nameLogic),

		new Option('dry').setDescription(
			'Run the CLI without creating the files'
		),

		new Option('no-colors').setDescription('Disable output colors'),

		new Option('test-mode', { type: 'string' }).setDescription(
			'Sets test mode [separated / combined]'
		),
	],
	testMode: [
		new Option('combined')
			.setDescription('tests will remain in src/ folder')
			.setLogic(combinedLogic),

		new Option('separated')
			.setDescription('tests fies will be in __tests__/ directory')
			.setLogic(separatedLogic),
	],
	files: {
		rename: {
			'_package.json': 'package.json',
			_gitignore: '.gitignore',
		},
	},
};
