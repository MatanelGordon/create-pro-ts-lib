#!/usr/bin/env node
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk');
const { promptsWrapper: prompts, CANCELLED_REQUEST } = require('./utils/prompts');
const config = require('./config');
const loadBaseLogic = require('./logics/base');
const FileManager = require('./utils/FilesManager');
const { resolveDirectory, ArgumentExtractor } = require('./utils/arguments');
const { postProcessFiles } = require('./utils/template');
const { optionsToPrompts, toYargsOptionsParam, OptionsCollection } = require('./utils/options');
const Loader = require('./utils/Loader');

const { options } = config;

const mainCommand = yargs(hideBin(process.argv))
    .usage('usage: \n\r create-pro-ts-lib <directory> <options>')
    .help()
    .version('1.0.0')
    .options(toYargsOptionsParam(options))
    .positional('directory', {
        describe: 'A directory where you want initialize your ts project',
        type: 'string',
    });

// todo: put lib files in src/ folder
// todo: enable nesting in readTemplateFiles
// todo: organize templates structure to support it
// todo: there will be a bug with rename - make sure it doesnt happen
// todo: make it optional to rename src/ to lib/ or even blank (./) using --source-dir flag
// todo: prettify output

async function main(argv) {
    const dir = resolveDirectory(argv);
    const filesManager = new FileManager(dir);
    const argumentExtractor = new ArgumentExtractor(config);
    const allOptions = new OptionsCollection().addAll(options);
    const flags = argumentExtractor.getFlags(argv);
    const cliOptions = argumentExtractor.getOptions(argv);
    //todo: use loader for better output
    const loader = await new Loader().init();

    //build questions
    const questions = [];

    if (!flags['name']) {
        questions.push({
            type: 'text',
            name: 'name',
            message: 'Project Name',
            initial: dir,
        });
    }

    if (cliOptions.length === 0 && !flags['all']) {
        questions.push(optionsToPrompts(options));
    }

    try {
        const formResults = await prompts(questions);
        const name = formResults?.name ?? flags['name'].value;
        const prettier = allOptions.findByName('prettier');
        const eslint = allOptions.findByName('eslint');
        const prettierEslint = allOptions.findByName('prettier-eslint');
        const allFlag = flags['all']?.flag;
        const nameFlag = flags['name']?.flag;
        const sourceDirFlag = flags['src-dir'];
        const selectedOptions = new OptionsCollection()
            .addAll(cliOptions)
            .addAll(formResults?.options ?? []);

        if (
            selectedOptions.includes(prettier, eslint) ||
            selectedOptions.includes(prettierEslint)
        ) {
            selectedOptions.remove(prettier).remove(eslint).add(prettierEslint);
        }

        if (allFlag) {
            selectedOptions.removeAll().add(allFlag);
        }

        if (nameFlag) {
            selectedOptions.add(nameFlag);
        }

        const optionsPayload = { dir, options: selectedOptions.list, name, loader };
        await loadBaseLogic(filesManager, config, optionsPayload);
        await Promise.all(
            selectedOptions.list.map((option) =>
                option?.logic(filesManager, config, {
                    ...optionsPayload,
                    optionValue: argv[option.name],
                })
            )
        );

        await postProcessFiles(filesManager);

        if (sourceDirFlag) {
            await sourceDirFlag.flag.logic(dir, sourceDirFlag.value);
        }
    } catch (e) {
        if (e?.code === CANCELLED_REQUEST) {
            console.log(chalk.red(`Ok nevermind...`));
            return;
        }
        throw e;
    }
}

// Running the code
void main(mainCommand.argv);
