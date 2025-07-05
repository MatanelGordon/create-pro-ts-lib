const { createTemplateFilesDownloader } = require('../utils/template');

const TEMPLATE_PATH = 'templates/base';
const downloadBaseTemplateFiles = createTemplateFilesDownloader(TEMPLATE_PATH);

const baseLogic = async (fileManager, config, {name}) => {
	await downloadBaseTemplateFiles(fileManager, config);

	const nodeVersion = +process.version.slice(1).split('.')[0];

	if(nodeVersion < 20){
		throw new Exception("Required Node.js version is 20 or higher. Please update your Node.js version.");
	}

	const dynamicPackageJson = {
		devDependencies: {
			'@types/node': `^${nodeVersion}`,
		},
		name,
	};

	fileManager.add('package.json', dynamicPackageJson);
};

module.exports = baseLogic;
