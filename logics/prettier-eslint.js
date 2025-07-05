const { createTemplateFilesDownloader } = require('../utils/template');
const { prettierLogic } = require('./prettier');
const { eslintLogic } = require('./eslint');

const TEMPLATE_PATH = 'templates/prettier-eslint';
const downloadPrettierEslint = createTemplateFilesDownloader(TEMPLATE_PATH);
const prettierEslintLogic = async (filesManager, config) => {
	await eslintLogic(filesManager, config);
	filesManager.delete('.eslintrc.cjs');
	await prettierLogic(filesManager, config);
	await downloadPrettierEslint(filesManager, config);
};

module.exports = { prettierEslintLogic, TEMPLATE_PATH };
