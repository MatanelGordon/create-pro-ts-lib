#!/usr/bin/env node
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk');
const { promptsWrapper: prompts, CANCELLED_REQUEST } = require('./utils/prompts');
const config = require('./config');
const loadBaseLogic = require('./logics/base');
const FileManager = require('./utils/FilesManager');
const { resolveDirectory, ArgumentExtractor } = require('./utils/arguments');
const { postProcessFiles, ERRORS: TEMPLATE_ERROR } = require('./utils/template');
const { optionsToPrompts, toYargsOptionsParam, OptionsCollection } = require('./utils/options');

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
    const dir = resolveDirectory(argv);
    const argumentExtractor = new ArgumentExtractor(config);
    const allOptions = new OptionsCollection().addAll(options);
    const flags = argumentExtractor.getFlags(argv);
    const cliOptions = argumentExtractor.getOptions(argv);

    const prettier = allOptions.findByName('prettier');
    const eslint = allOptions.findByName('eslint');
    const prettierEslint = allOptions.findByName('prettier-eslint');
    const allFlag = flags['all']?.flag;
    const nameFlag = flags['name'];
    const sourceDirFlag = flags['src-dir'];

    //build questions
    const questions = [];

    if (!dir || /\//.test(dir)) {
        questions.push({
            type: 'text',
            name: 'name',
            message: 'Project Name',
            initial: (dir ?? '').replaceAll('/','-'),
        });
    }

    if (cliOptions.length === 0 && !allFlag) {
        questions.push(optionsToPrompts(options));
    }

    try {
        const formResults = await prompts(questions);
        const name = formResults?.name ?? dir ?? nameFlag.value;
        const actualDir = dir ?? name;
        const filesManager = new FileManager(actualDir);

        const selectedOptions = new OptionsCollection()
            .addAll(cliOptions)
            .addAll(formResults?.options);

        if(allFlag){
            selectedOptions.addAll(options);
        }

        if (
            selectedOptions.includes(prettier, eslint) ||
            selectedOptions.includes(prettierEslint)
        ) {
            selectedOptions.remove(prettier).remove(eslint).add(prettierEslint);
        }

        if (nameFlag) {
            selectedOptions.add(nameFlag.flag);
        }
        console.log(`\r\nScaffolding project in ${filesManager.path}...\r\n`);
        const logicPayload = { dir, options: selectedOptions.list, name };
        await loadBaseLogic(filesManager, config, logicPayload);
        await Promise.all(
            selectedOptions.list.map((option) =>
                option?.logic(filesManager, config, {
                    ...logicPayload,
                    optionValue: argv[option.name],
                })
            )
        );

        await postProcessFiles(filesManager);

        if (sourceDirFlag) {
            await sourceDirFlag.flag.logic(dir, sourceDirFlag.value, logicPayload);
        }

        console.log(
            `${chalk.green`Success!`} \r\n\r\nNow Run: \r\n\t${chalk.hex(
                '#c58af9'
            )`cd`} ${chalk.blue(actualDir)} \r\n\t${chalk.hex(
                '#c58af9'
            )`npm`} install \r\n\r\nView "scripts" in ${chalk.green(
                `package.json`
            )} for available scripts\r\n\r\n`
        );

    } catch (e) {
        if (e?.code === CANCELLED_REQUEST) {
            console.error(chalk.red`Ok nevermind...`);
            return;
        }
        if (e.code === TEMPLATE_ERROR.DIR_EXISTS_ERROR) {
            console.error(chalk.red`ERROR! Directory already exists`);
            return;
        }
        throw e;
    }
}

// Running the code
void main(mainCommand.argv);
