#!/usr/bin/env node
const _ = require('lodash');
const yargs = require('yargs');
const {hideBin} = require('yargs/helpers');
const chalk = require('chalk');
const {promptsWrapper: prompts, CANCELLED_REQUEST} = require('./utils/prompts');
const FileManager = require('./utils/filesManager');
const {optionsToPrompts, toYargsOptionsParam, OptionsHandler} = require('./utils/options');
const config = require('./config');
const loadBaseLogic = require('./logics/base')
const {options} = config;

const mainCommand = yargs(hideBin(process.argv))
    .usage('usage: \n\r create-pro-ts-lib <directory> <options>')
    .help()
    .version('1.0.0')
    .options(toYargsOptionsParam(options))
    .positional('directory', {describe: 'A directory where you want initialize your ts project', type: 'string'})

const resolveDirectory = argv => {
    const dirs = argv._;
    if (dirs.length > 1) {
        throw new Error(`expected 1 directory, received ${dirs.length} - ${dirs}`);
    }
    return dirs[0];
}

async function main(argv) {
    const dir = resolveDirectory(argv);
    const filesManager = new FileManager(dir);
    const optionsHandler = new OptionsHandler(options);
    const flags = optionsHandler.getFlags(argv);
    const cliOptions = optionsHandler.getOptions(argv);

    if (flags['all']) {
        // 'all' logic here
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
        const selectedOptions = _.uniqBy([...cliOptions, ...formResults?.options ?? [],])

        console.log({selectedOptions})

        await loadBaseLogic(filesManager, config);
        await Promise.all(selectedOptions.map(option => option?.logic(filesManager, config)));

    } catch (e) {
        if(e?.code === CANCELLED_REQUEST){
            console.log(chalk.red(`ok never mind...`));
            return;
        }

        throw e;
    }
}

void main(mainCommand.argv);

