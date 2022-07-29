const { nodemonLogic } = require('./nodemon');
const { prettierEslintLogic } = require('./prettier-eslint');
const { testsLogic } = require('./tests');

const allLogic = async (filesManager, config, payload) => {
    await nodemonLogic(filesManager, config, payload);
    await prettierEslintLogic(filesManager, config, payload);
    await testsLogic(filesManager, config, payload);
};

module.exports = { allLogic };
