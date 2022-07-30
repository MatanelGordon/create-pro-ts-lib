const path = require("path");

const SEPERATED_TESTS_DIR = '__tests__';
const testModeLogic = (filesManager, testMode) => {
    if(testMode?.toLowerCase?.() === 'seperated') {
        Object.keys(filesManager.relativeFiles)
            .filter(path => /\.test\.ts$/.test(path))
            .forEach(testPath => {
                filesManager.change(testPath, path.join(SEPERATED_TESTS_DIR, testPath));
            })
    }
}

module.exports = {testModeLogic, SEPERATED_TESTS_DIR};