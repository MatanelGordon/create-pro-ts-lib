#!/usr/bin/env node
const yargs = require('yargs');
const {hideBin} = require('yargs/helpers');
const chalk = require('chalk');
const {promptsWrapper: prompts, CANCELLED_REQUEST} = require('./utils/prompts');
const config = require('./config');
const loadBaseLogic = require('./logics/base')
const FileManager = require('./utils/filesManager');
const resolveDirectory = require('./utils/resolveDirectory');
const {postProcessFiles} = require("./utils/template");
const {optionsToPrompts, toYargsOptionsParam, OptionsHandler, OptionsCollection} = require('./utils/options');

const {options} = config;

const mainCommand = yargs(hideBin(process.argv))
    .usage('usage: \n\r create-pro-ts-lib <directory> <options>')
    .help()
    .version('1.0.0')
    .options(toYargsOptionsParam(options))
    .positional('directory', {describe: 'A directory where you want initialize your ts project', type: 'string'})

const getOptionByName = name => options.find(op => op.name === name);

async function main(argv) {
    const dir = resolveDirectory(argv);
    const filesManager = new FileManager(dir);
    const optionsHandler = new OptionsHandler(options);
    const flags = optionsHandler.getFlags(argv);
    const cliOptions = optionsHandler.getOptions(argv).map(({option}) => option);

    if (flags['all']) {
        const all = getOptionByName('all');
        await all.logic(filesManager, config);
        await postProcessFiles(filesManager);
        return;
    }

    //build questions
    const questions = []

    if (!flags['name']) {
        questions.push({
            type: 'text', name: 'name', message: 'Project Name', initial: dir
        })
    }

    if (cliOptions.length === 0) {
        questions.push(optionsToPrompts(options));
    }

    try {
        const formResults = await prompts(questions);
        const selectedOptions = new OptionsCollection()
            .addAll(cliOptions)
            .addAll(formResults?.options ?? []);

        const name = formResults?.name ?? argv.name;
        const prettier = getOptionByName('prettier');
        const eslint = getOptionByName('eslint');
        const prettierEslint = getOptionByName('prettier-eslint');

        if(selectedOptions.includes(prettier, eslint) || selectedOptions.includes(prettierEslint)){
            selectedOptions
                .remove(prettier)
                .remove(eslint)
                .add(prettierEslint)
        }

        const optionsPayload = {dir, options:selectedOptions.list, name}
        await loadBaseLogic(filesManager, config, optionsPayload);
        await Promise.all(selectedOptions.list.map(option => option?.logic(filesManager, config, optionsPayload)));
        await postProcessFiles(filesManager);
    } catch (e) {
        if(e?.code === CANCELLED_REQUEST){
            console.log(chalk.red(`Ok nevermind...`));
            return;
        }
        throw e;
    }
}

// Running the code
void main(mainCommand.argv);

