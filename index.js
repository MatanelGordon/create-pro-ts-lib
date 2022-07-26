#!/usr/bin/env node
const yargs = require('yargs');
const {hideBin} = require('yargs/helpers');
const chalk = require('chalk');
const _ = require("lodash");
const {promptsWrapper: prompts, CANCELLED_REQUEST} = require('./utils/prompts');
const config = require('./config');
const loadBaseLogic = require('./logics/base')
const FileManager = require('./utils/filesManager');
const {resolveDirectory, ArgumentExtractor} = require('./utils/arguments');
const {postProcessFiles} = require("./utils/template");
const {optionsToPrompts, toYargsOptionsParam, OptionsCollection} = require('./utils/options');

const {options} = config;

const mainCommand = yargs(hideBin(process.argv))
    .usage('usage: \n\r create-pro-ts-lib <directory> <options>')
    .help()
    .version('1.0.0')
    .options(toYargsOptionsParam(options))
    .positional('directory', {describe: 'A directory where you want initialize your ts project', type: 'string'})


// todo: create wanted behaviour
// npm create pro-ts-lib my-dir -e -n --name matanel - should not ask anything
// npm create pro-ts-lib myDir --all - should only ask for name

async function main(argv) {
    const dir = resolveDirectory(argv);
    const filesManager = new FileManager(dir);
    const argumentExtractor = new ArgumentExtractor(config);
    const allOptions = new OptionsCollection().addAll(options);
    const flags = argumentExtractor.getFlags(argv);
    const cliOptions = argumentExtractor.getOptions(argv);
    console.log({
        cliOptions : cliOptions.map(x => x.toString()),
        flags: _.mapValues(flags, x => x.toString()),
    });

    //build questions
    const questions = []

    if (!flags['name']) {
        questions.push({
            type: 'text', name: 'name', message: 'Project Name', initial: dir
        })
    }

    if (cliOptions.length === 0 && !flags['all']) {
        questions.push(optionsToPrompts(options));
    }

    try {
        const formResults = await prompts(questions);
        const selectedOptions = new OptionsCollection()
            .addAll(cliOptions)
            .addAll(formResults?.options ?? []);

        const name = formResults?.name ?? argv.name;
        const prettier = allOptions.findByName('prettier');
        const eslint = allOptions.findByName('eslint');
        const prettierEslint = allOptions.findByName('prettier-eslint');

        if(selectedOptions.includes(prettier, eslint) || selectedOptions.includes(prettierEslint)){
            selectedOptions
                .remove(prettier)
                .remove(eslint)
                .add(prettierEslint)
        }

        const allFeaturesFlag = flags['all'];

        if(allFeaturesFlag){
            selectedOptions
                .removeAll()
                .add(allFeaturesFlag)
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

