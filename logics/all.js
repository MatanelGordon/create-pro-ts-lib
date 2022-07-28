const { nodemonLogic } = require('./nodemon');
const { prettierEslintLogic } = require('./prettier-eslint');
const { testsLogic } = require('./tests');

const allLogic = async (filesManager, config) => {
    await nodemonLogic(filesManager, config);
    await prettierEslintLogic(filesManager, config);
    await testsLogic(filesManager, config);
};

module.exports = { allLogic };
