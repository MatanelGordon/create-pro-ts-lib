const { createTemplateFilesDownloader } = require('../utils/template');

const TEMPLATE_PATH = 'templates/base';
const downloadBaseTemplateFiles = createTemplateFilesDownloader(TEMPLATE_PATH);

const baseLogic = async (fileManager, config) => {
	await downloadBaseTemplateFiles(fileManager, config);

	const nodeVersion = +process.version.slice(1).split('.')[0];

	const dynamicPackageJson = {
		devDependencies: {
			'@types/node': `^${nodeVersion}`,
		},
	};

	fileManager.add('package.json', dynamicPackageJson);
};

module.exports = baseLogic;
