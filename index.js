#!/usr/bin/env node
const _ = require('lodash');
const yargs = require('yargs');
const {hideBin} = require('yargs/helpers');
const prompts = require('prompts');
const chalk = require('chalk');
const NOOP = () => {};

const options = {
    tests:    {describe: 'Adds tests to your ts project', type: 'boolean', alias: 't'},
    nodemon:  {describe: 'Adds nodemon to your ts project', type:"boolean", alias:"n"},
    eslint:   {describe: 'Adds eslint to your ts project', type: 'boolean', alias: 'e'},
    prettier: {describe: 'Adds prettier to your ts project', type:'boolean', alias:'p'}
}

const mainCommand = yargs(hideBin(process.argv))
    .usage('usage: \n\r create-pro-ts-lib <directory> <options>')
    .help()
    .version('1.0.0')
    .options(options)
    .positional('directory', {describe: 'A directory where you want initialize your ts project', type: 'string'})

const resolveDirectory = argv => {
    const dirs = argv._;
    if (dirs.length > 1) {
        throw new Error(`expected 1 directory, received ${dirs.length} - ${dirs}`);
    }
    return dirs[0];
}

const optionsToPrompts = (options) => ({
    type:'multiselect',
    name: 'options',
    message: 'pick your features',
    hint: '- Space to select. Return to submit',
    instructions: false,
    min:1,
    choices: Object.keys(options).map(option => ({
        title: option,
        selected: true,
        value: option
    }))
})

const promptsWrapper = (questions, onCancel = NOOP, onSubmit = NOOP) => {
    const onCancelWrapper = prompt => {
        onCancel(prompt);
        throw new Error('cancelled prompts');
    }

    return prompts(questions, {onCancel:onCancelWrapper, onSubmit})
}


async function main(argv) {
    const dir = resolveDirectory(argv);
    const cmdFlags = _.pick(argv, Object.keys(options));
    const isNoFlags = Object.keys(cmdFlags).length === 0;

    const questions = [
        {type: 'text', name: 'name', message: 'project-name', initial: dir}
    ]

    if (isNoFlags) {
        questions.push(optionsToPrompts(options));
    }

    try{
        const formResults = await promptsWrapper(questions);
        console.log(formResults);
    }
    catch (e) {
        console.log(chalk.red(`ok never mind...`));
    }
}

void main(mainCommand.argv);

