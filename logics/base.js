const ErrorWithCode = require('../utils/ErrorWithCode');
const { createTemplateFilesDownloader } = require('../utils/template');

const NODE_VERSION_TOO_OLD = 'NODE_VERSION_TOO_OLD';

const TEMPLATE_PATH = 'templates/base';
const downloadBaseTemplateFiles = createTemplateFilesDownloader(TEMPLATE_PATH);

const baseLogic = async (fileManager, config, {name}) => {
	await downloadBaseTemplateFiles(fileManager, config);

	const nodeVersion = +process.version.slice(1).split('.')[0];

	if(nodeVersion < 20){
		throw new ErrorWithCode("Required Node.js version is 20 or higher. Please update your Node.js version.", NODE_VERSION_TOO_OLD);
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
