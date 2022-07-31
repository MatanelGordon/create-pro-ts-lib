const { readTemplateFiles } = require('../utils/template');
const _ = require('lodash');
const TEMPLATE_PATH = 'templates/prettier-eslint';

const prettierEslintLogic = async (filesManager, config) => {
    const prettierEslintFiles = await readTemplateFiles(TEMPLATE_PATH, config);
    const prettierFiles = await readTemplateFiles('templates/prettier', config);
    const eslintFiles = await readTemplateFiles('templates/eslint', config);

    _.remove(eslintFiles, ({ name }) => name === '.eslintrc.cjs');

    [...prettierFiles, ...eslintFiles, ...prettierEslintFiles].forEach(({ name, content }) => {
        filesManager.add(name, content);
    });
};

module.exports = { prettierEslintLogic, TEMPLATE_PATH };
