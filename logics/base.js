const ErrorWithCode = require('../utils/ErrorWithCode');
const {
	detectPackageManager,
	detectPackageManagerVersion,
} = require('../utils/package-manager');
const { createTemplateFilesDownloader } = require('../utils/template');

const NODE_VERSION_TOO_OLD = 'NODE_VERSION_TOO_OLD';

const TEMPLATE_PATH = 'templates/base';
const downloadBaseTemplateFiles = createTemplateFilesDownloader(TEMPLATE_PATH);

const baseLogic = async (fileManager, config, { name }) => {
	await downloadBaseTemplateFiles(fileManager, config);

	const nodeVersion = +process.version.slice(1).split('.')[0];

	if (nodeVersion < 20) {
		throw new ErrorWithCode(
			'Required Node.js version is 20 or higher. Please update your Node.js version.',
			NODE_VERSION_TOO_OLD
		);
	}

	const packageManager = detectPackageManager();
	const packageManagerVersion = detectPackageManagerVersion();

	const dynamicPackageJson = {
		devDependencies: {
			'@types/node': `^${nodeVersion}`,
		},
		name,
	};

	// for those using corepack for specific package managers enforcement
	if (packageManagerVersion && packageManager === 'pnpm') {
		const major = packageManagerVersion.split('.')[0];
		dynamicPackageJson.packageManager = `${packageManager}@${major}.0.0`;
	}

	// for those using corepack for specific package managers enforcement
	if (packageManagerVersion && packageManager === 'yarn') {
		dynamicPackageJson.packageManager = `${packageManager}@${packageManagerVersion}`;
	}

	if (packageManagerVersion) {
		dynamicPackageJson.engines = {};
		const major = packageManagerVersion.split('.')[0];

		if (major && packageManager === 'npm') {
			dynamicPackageJson.engines.npm = `>=${major}.0.0`;
		}

		if (packageManager === 'yarn') {
			dynamicPackageJson.engines.yarn = `>=${packageManagerVersion}`;
		}

		if (major && packageManager === 'pnpm') {
			dynamicPackageJson.engines.pnpm = `>=${major}.0.0`;
		}
	}

	fileManager.add('package.json', dynamicPackageJson);
};

module.exports = baseLogic;
