const path = require('path');
const ErrorWithCode = require("../utils/ErrorWithCode");

const DEFAULT_SOURCE_DIR = 'src';
const SRC_DIR_BAD_PARAMS_CODE = 'SRC_DIR_BAD_PARAMS_CODE';

const srcDirLogic = (filesManager, srcDir) => {
    if(srcDir === DEFAULT_SOURCE_DIR) return;

    if(!srcDir){
        throw new ErrorWithCode('expected "dir" to be string but received undefined', SRC_DIR_BAD_PARAMS_CODE)
    }

    Object.keys(filesManager.relativeFiles)
        .filter(path => /^src\//.test(path))
        .forEach(filePath => {
            const pathWithoutSrc = filePath.split('/').slice(1).join('/');
            filesManager.change(filePath, path.join(srcDir, pathWithoutSrc));
        })
}

module.exports = { srcDirLogic, DEFAULT_SOURCE_DIR, SRC_DIR_BAD_PARAMS_CODE };
