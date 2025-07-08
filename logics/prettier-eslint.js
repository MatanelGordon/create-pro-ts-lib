const { createTemplateFilesDownloader } = require('../utils/template');

const TEMPLATE_PATH = 'templates/prettier-eslint';
const downloadPrettierEslint = createTemplateFilesDownloader(TEMPLATE_PATH);
const prettierEslintLogic = async (filesManager, config) => {
	await downloadPrettierEslint(filesManager, config);
};

module.exports = { prettierEslintLogic, TEMPLATE_PATH };
