const path = require('path');
const { existsSync } = require('fs');
const { readdir, rm } = require('fs/promises');
const mv = require('../utils/mvWrapper');
const FilesManager = require('../utils/FilesManager');
const { createTemplateFilesDownloader, createFiles } = require('../utils/template');
const chalk = require("chalk");
const ErrorWithCode = require("../utils/ErrorWithCode");

const DEFAULT_SOURCE_DIR = 'src';

const moveFilesForce = async (source, dest) => {
    const fileManager = new FilesManager(dest);
    const download = createTemplateFilesDownloader(source);
    await download(fileManager, {});
    await createFiles(fileManager, { forceWrite: true });
    await rm(source, { recursive: true, force: true, retryDelay: 1000, maxRetries: 5 });
};
const SRC_DIR_BAD_PARAMS_CODE = 'SRC_DIR_BAD_PARAMS_CODE';
const srcDirLogic = async (dir, sourceDir) => {
    console.log('--src-dir activated! Re-organizing project...');
    if (!sourceDir || sourceDir === DEFAULT_SOURCE_DIR) return;

    if (!dir){
        throw new ErrorWithCode('expected "dir" to be string but received undefined', 400)
    }

    try{
        const oldPath = path.join(dir, DEFAULT_SOURCE_DIR);
        const newPath = path.join(dir, sourceDir);
        const isClearToMove = !existsSync(newPath) || (await readdir(newPath)).length === 0;
        if (isClearToMove) {
            return mv(oldPath, newPath);
        }
        return moveFilesForce(oldPath, newPath);
    }
    catch (e) {
        console.error(chalk.red`Failed to execute --src-dir logic:`, e.message)
    }

};

module.exports = { srcDirLogic, DEFAULT_SOURCE_DIR, SRC_DIR_BAD_PARAMS_CODE };
