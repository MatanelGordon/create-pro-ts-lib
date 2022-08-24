#!/usr/bin/env node
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk');
const path = require('path');
const { promptsWrapper: prompts, CANCELLED_REQUEST, optionsToPromptsChoices} = require('./utils/prompts');
const config = require('./config');
const loadBaseLogic = require('./logics/base');
const FileManager = require('./utils/FilesManager');
const { resolveDirectory, ArgumentExtractor } = require('./utils/arguments');
const { postProcessFiles, ERRORS: TEMPLATE_ERROR, createFiles } = require('./utils/template');
const { toYargsOptionsParam, OptionsCollection } = require('./utils/options');
const { SRC_DIR_BAD_PARAMS_CODE } = require('./logics/flags/src-dir');

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
    console.log('\n');
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
    let shouldSetDifferentName = false;

    //build questions
    const questions = [];

    if (dryFlag) {
        console.warn('WARNING! --dry flag appeared and no actual files will be created');
    }

    if(!cliDir && nameFlag){
        console.warn(`WARNING! can't use --name without specifying dir`)
    }

    if (!cliDir || (/[\/.]/.test(cliDir) && !nameFlag)) {
        questions.push({
            type: 'text',
            name: 'name',
            message: 'Project Name',
            initial: (cliDir ?? '').replaceAll('/', '-'),
            "validate": value => {
                if(value.length === 0)
                    return 'You must fill this field'
                else if (!/[a-zA-z0-9_\-@\/]/.test(value))
                    return 'This name contains illegal characters'
                return true;
            } ,
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
            choices
        })
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

        if (sourceDirFlag) {
            sourceDirFlag.flag.logic(filesManager, sourceDirFlag.value);
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
        const scripts = Object
            .keys(filesManager.get('package.json').scripts ?? {})
            .filter(x => !(/^pre/.test(x) || /^post/.test(x)));

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
            selectedOptions.includes('husky') ? `\r\n\t ${chalk.greenBright`// git init or clone a repo`}` : '',
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
        const { red } = chalk;
        switch (e?.code) {
            case CANCELLED_REQUEST:
                console.error(red`Ok nevermind...`);
                break;
            case TEMPLATE_ERROR.DIR_EXISTS_ERROR:
                console.error(red`ERROR! Directory already exists`);
                break;
            case TEMPLATE_ERROR.DIR_NOT_EMPTY_ERROR:
                console.error(red`ERROR! Directory contains files`)
                break;
            case SRC_DIR_BAD_PARAMS_CODE:
                console.error(red`Error! could not execute `);
                break;
            default:
                console.error(chalk.red(e.message));
        }
    }
}

// Running the code
void main(mainCommand.argv);
