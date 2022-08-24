const path = require('path');
const ErrorWithCode = require('../../utils/ErrorWithCode');

const DEFAULT_SOURCE_DIR = 'src';
const SRC_DIR_BAD_PARAMS_CODE = 'SRC_DIR_BAD_PARAMS_CODE';
const SRC_DIR_ILLEGAL = 'SRC_DIR_ILLEGAL'
const srcDirLogic = (filesManager, srcDir) => {
    if (srcDir === DEFAULT_SOURCE_DIR) return;

    if (typeof srcDir !== 'string') {
        throw new ErrorWithCode(
            `expected "src-dir" to be string but received ${srcDir}`,
            SRC_DIR_BAD_PARAMS_CODE
        );
    }

    if(/\s|[#%$^&*()!\/\\{}\[\]+~`"',|]/.test(srcDir)){
        throw new ErrorWithCode(
            `"src-dir" should have no spaces or special characters`,
            SRC_DIR_ILLEGAL
        );
    }

    Object.keys(filesManager.relativeFiles)
        .filter(path => /^src\//.test(path))
        .forEach(filePath => {
            const pathWithoutSrc = filePath.split('/').slice(1).join('/');
            filesManager.change(filePath, path.join(srcDir, pathWithoutSrc));
        });
};

module.exports = { srcDirLogic, DEFAULT_SOURCE_DIR, SRC_DIR_BAD_PARAMS_CODE };
