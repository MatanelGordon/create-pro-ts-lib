#!/usr/bin/env node

const yargs = require('yargs');
const { exit, env } = require('process');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk');
const path = require('path');
const {
	promptsWrapper: prompts,
	CANCELLED_REQUEST,
	optionsToPromptsChoices,
} = require('./utils/prompts');
const config = require('./config');
const loadBaseLogic = require('./logics/base');
const FileManager = require('./utils/FilesManager');
const { resolveDirectory, ArgumentExtractor } = require('./utils/arguments');
const {
	postProcessFiles,
	ERRORS: TEMPLATE_ERROR,
	createFiles,
} = require('./utils/template');
const { toYargsOptionsParam, OptionsCollection } = require('./utils/options');

const { options } = config;

const mainCommand = yargs(hideBin(process.argv))
	.usage('usage: \n\r create-pro-ts-lib <directory> <options>')
	.help()
	.version('1.0.0')
	.options(toYargsOptionsParam([...options, ...config.flags]))
	.positional('directory', {
		describe: 'A directory where you want initialize your ts project',
		type: 'string',
		demandOption: false,
	});

async function main(argv) {
	const cliDir = resolveDirectory(argv);
	const argumentExtractor = new ArgumentExtractor(config);
	const allOptions = new OptionsCollection().addAll(options);
	const allBuildOptions = new OptionsCollection().addAll(config.buildOptions)
	const allFlags = new OptionsCollection().addAll(config.flags);
	const flags = argumentExtractor.getFlags(argv);
	const cliOptions = argumentExtractor.getOptions(argv);
	const cliBuildOptions = argumentExtractor.getBuildOptions(argv);

	const prettier = allOptions.findByName('prettier');
	const eslint = allOptions.findByName('eslint');
	const prettierEslint = allOptions.findByName('prettier-eslint');
	const webpack = allBuildOptions.findByName('webpack');
	const vite = allBuildOptions.findByName('vite');
	const allFlag = flags['all']?.flag;
	const nameFlag = flags['name'];
	const dryFlag = flags['dry'];
	let shouldSetDifferentName = false;

	//build questions
	const questions = [];

	if (flags['no-colors']) {
		chalk.level = 0;
	}

	if (dryFlag) {
		console.log(
			chalk.hex(
				'#FF7F11'
			)`**Warning: --dry flag appeared and no actual files will be created`
		);
	}

	if (!cliDir && nameFlag) {
		console.log(
			chalk.hex(
				'#FF7F11'
			)`**Warning: can't use --name without specifying dir`
		);
	}

	if (!cliDir || (/[\/.]/.test(cliDir) && !nameFlag)) {
		questions.push({
			type: 'text',
			name: 'name',
			message: 'Project Name',
			initial: (cliDir ?? '').replaceAll('/', '-'),
			validate: value => {
				if (value.length === 0) return 'You must fill this field';
				else if (!/[a-zA-z0-9_\-@\/]/.test(value))
					return 'This name contains illegal characters';
				return true;
			},
		});
		shouldSetDifferentName = true;
	}

	if (!allFlag && cliOptions.length === 0) {
		const choices = optionsToPromptsChoices(options);
		questions.push({
			type: 'multiselect',
			name: 'options',
			message: 'Select your features',
			hint: '- Space to select. Return to submit',
			instructions: false,
			min: 1,
			choices,
		});
	}

	if (cliBuildOptions.length !== 1) {
		if (cliBuildOptions.length > 1) {
			console.log(
				chalk.hex(
					'#FF7F11'
				)`Warning: expected 1 build option, received ${cliBuildOptions.length}`
			);
		}

		questions.push({
			type: 'select',
			name: 'buildOptions',
			hint: 'Return/Enter to submit',
			message: 'Select your build tool',
			choices: optionsToPromptsChoices(config.buildOptions),
		});
	}

	try {
		const formResults = await prompts(questions);
		const name = formResults?.name ?? cliDir ?? nameFlag.value;
		const dir = cliDir ?? name;

		const filesManager = new FileManager(dir);

		const selectedOptions = new OptionsCollection()
			.addAll(cliOptions)
			.addAll(formResults?.options);

		const selectedBuildOptions = new OptionsCollection()
			.addAll(cliOptions)
			.add(formResults?.buildOption);

		if (allFlag) {
			selectedOptions.addAll(options);
			if (selectedBuildOptions.list.length === 0) {
				const defaultOption = config.buildOptions.find(
					op => op.initialSelected
				);

				console.log(
					`Info: no build option specified, using ${defaultOption.name} as default`
				);

				selectedBuildOptions.add(defaultOption);
			}
		}

		if (selectedOptions.includes(webpack, vite)) {
			console.warn(
				'WARNING: Redundant Webpack and Vite configuration - It is recommended to choose only one build tool'
			);
		}

		if (
			selectedOptions.includes(prettier, eslint) ||
			selectedOptions.includes(prettierEslint)
		) {
			selectedOptions.remove(prettier).remove(eslint).add(prettierEslint);
		}

		if (nameFlag || shouldSetDifferentName) {
			const nameFlagInstance =
				nameFlag?.flag ?? allFlags.findByName('name');
			selectedOptions.add(nameFlagInstance);
		}

		const logicPayload = { dir, options: selectedOptions, name, flags };
		await loadBaseLogic(filesManager, config, logicPayload);
		await Promise.all(
			selectedOptions.list.map(async option =>
				option?.logic(filesManager, config, {
					...logicPayload,
					optionValue: argv[option.name],
				})
			)
		);

		postProcessFiles(filesManager);

		if (!dryFlag) {
			await createFiles(filesManager);
		} else {
			Object.keys(filesManager.relativeFiles).forEach(file => {
				console.log(chalk.green`created`, file);
			});
		}

		//printing the final output
		const scripts = Object.keys(
			filesManager.get('package.json').scripts ?? {}
		).filter(x => !(/^pre/.test(x) || /^post/.test(x)));

		const shorthandScripts = ['start', 'test'];

		const purple = chalk.hex('#c58af9');
		const { blue } = chalk;
		console.log(
			'\r\n',
			chalk.green.bold`Success!`,
			'\r\n',
			`path: ${purple(path.join(process.cwd(), dir))}`,
			'\r\n\r\n',
			'Now run:',
			dir === '.' ? '' : `\r\n\t ${purple`cd`} ${blue(dir)}`,
			selectedOptions.includes('husky')
				? `\r\n\t ${chalk.greenBright`// git init or clone a repo`}`
				: '',
			`\r\n\t ${purple`npm`} install`,
			'\r\n\r\n',
			'Available Commands:',
			scripts
				.map(
					script =>
						`\r\n\t${purple`npm`} ${
							shorthandScripts.includes(script) ? '' : 'run '
						}${script}`
				)
				.sort((a, b) =>
					(a.split('run').at(1) ?? a).localeCompare(
						b.split('run').at(1) ?? b
					)
				)
				.join(''),
			'\r\n'
		);
	} catch (e) {
		const { red } = chalk;
		switch (e?.code) {
			case CANCELLED_REQUEST:
				console.error(red`Ok nevermind...`);
				break;
			case TEMPLATE_ERROR.DIR_EXISTS_ERROR:
				console.error(red`ERROR! Directory already exists`);
				break;
			case TEMPLATE_ERROR.DIR_NOT_EMPTY_ERROR:
				console.error(red`ERROR! Directory contains files`);
				break;
			default:
				console.error(chalk.red(e.message));
		}
		if(env["VERBOSE"]){
			console.error(e);
		}
		exit(1);
	}
}

// Running the code
void main(mainCommand.argv);
