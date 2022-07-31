#!/usr/bin/env node
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk');
const { promptsWrapper: prompts, CANCELLED_REQUEST } = require('./utils/prompts');
const config = require('./config');
const loadBaseLogic = require('./logics/base');
const FileManager = require('./utils/FilesManager');
const { resolveDirectory, ArgumentExtractor } = require('./utils/arguments');
const { postProcessFiles, ERRORS: TEMPLATE_ERROR, createFiles } = require('./utils/template');
const { optionsToPrompts, toYargsOptionsParam, OptionsCollection } = require('./utils/options');
const { SRC_DIR_BAD_PARAMS_CODE } = require('./logics/src-dir');

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
    const allFlags = new OptionsCollection().addAll(config.flags);
    const flags = argumentExtractor.getFlags(argv);
    const cliOptions = argumentExtractor.getOptions(argv);

    const prettier = allOptions.findByName('prettier');
    const eslint = allOptions.findByName('eslint');
    const prettierEslint = allOptions.findByName('prettier-eslint');
    const allFlag = flags['all']?.flag;
    const nameFlag = flags['name'];
    const sourceDirFlag = flags['src-dir'];
    const dryFlag = flags['dry'];
    const testsModeFlag = flags['test-mode'];
    let shouldSetDifferentName = false;

    //build questions
    const questions = [];

    if (dryFlag) {
        console.log('warning! --dry flag appeared and no actual files will be created');
    }

    if (!cliDir || /\//.test(cliDir)) {
        questions.push({
            type: 'text',
            name: 'name',
            message: 'Project Name',
            initial: (cliDir ?? '').replaceAll('/', '-'),
            validate: value => value.length > 0 || 'You must fill this field',
        });
        shouldSetDifferentName = true;
    }

    if (cliOptions.length === 0 && !allFlag) {
        questions.push(optionsToPrompts(options));
    }

    if (flags['no-colors']) {
        chalk.level = 0;
    }

    try {
        const formResults = await prompts(questions);
        const name = formResults?.name ?? cliDir ?? nameFlag.value;
        const dir = cliDir ?? name;
        const filesManager = new FileManager(dir);

        const selectedOptions = new OptionsCollection()
            .addAll(cliOptions)
            .addAll(formResults?.options);

        if (allFlag) {
            selectedOptions.addAll(options);
        }

        if (
            selectedOptions.includes(prettier, eslint) ||
            selectedOptions.includes(prettierEslint)
        ) {
            selectedOptions.remove(prettier).remove(eslint).add(prettierEslint);
        }

        if (nameFlag || shouldSetDifferentName) {
            const nameFlagInstance = nameFlag?.flag ?? allFlags.findByName('name');
            selectedOptions.add(nameFlagInstance);
        }

        const logicPayload = { dir, options: selectedOptions.list, name, flags };
        await loadBaseLogic(filesManager, config, logicPayload);
        await Promise.all(
            selectedOptions.list.map(async option =>
                option?.logic(filesManager, config, {
                    ...logicPayload,
                    optionValue: argv[option.name],
                })
            )
        );

        if (sourceDirFlag) {
            sourceDirFlag.flag.logic(filesManager, sourceDirFlag.value);
        }

        if (selectedOptions.includes('tests')) {
            let testModeValue = testsModeFlag?.value;
            if (!testsModeFlag) {
                testModeValue = (
                    await prompts({
                        type: 'select',
                        name: 'testMode',
                        message: 'Pick tests location',
                        choices: [
                            {
                                title: 'combined',
                                description: 'tests will remain in src/ folder',
                                value: 'combined',
                            },
                            {
                                title: 'seperated',
                                description: 'tests fies will be in __tests__/ directory',
                                value: 'seperated',
                            },
                        ],
                    })
                ).testMode;
            }

            const testModeFlagInstance = allFlags.findByName('test-mode');
            testModeFlagInstance.logic(filesManager, testModeValue);
        }

        postProcessFiles(filesManager);

        if (!dryFlag) {
            await createFiles(filesManager);
        } else {
            Object.keys(filesManager.relativeFiles).forEach(file => {
                console.log(chalk.green`created`, file);
            });
        }

        //printing the final output
        const scripts = Object.keys(filesManager.get('package.json').scripts ?? {});
        const shorthandScripts = ['start', 'test'];

        const purple = chalk.hex('#c58af9');
        const {blue} = chalk;
        console.log(
            '\r\n',
            chalk.green.bold`Success!`,
            '\r\n\r\n',
            'Now run:',
            `\r\n\t ${purple`cd`} ${blue(dir)}`,
            `\r\n\t ${purple`npm`} install`,
            '\r\n\r\n',
            'Available Commands:',
            scripts
                .map(
                    script =>
                        `${purple`npm`} ${shorthandScripts.includes(script) ? '' : 'run '}${script}`
                )
                .sort()
                .join(', '),
            '\r\n'
        );
    } catch (e) {
        const {red} = chalk;
        switch (e?.code) {
            case CANCELLED_REQUEST:
                console.error(red`Ok nevermind...`);
                break;
            case TEMPLATE_ERROR.DIR_EXISTS_ERROR:
                console.error(red`ERROR! Directory already exists`);
                break;
            case SRC_DIR_BAD_PARAMS_CODE:
                console.error(red`Error! could not execute `);
                break;
            default:
                throw e;
        }
    }
}

// Running the code
void main(mainCommand.argv);
