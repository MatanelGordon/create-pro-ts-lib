const { createTemplateFilesDownloader } = require('../utils/template');
const chalk = require('chalk');
const downLoadHusky = createTemplateFilesDownloader('templates/husky');

const huskyLogic = async (filesManager, config, { options }) => {
	console.log(
		chalk.hex(
			'#FF7F11'
		)`**Warning: Using husky requires you to use git. Either clone or create a repository BEFORE INSTALLATION`
	);
	await downLoadHusky(filesManager, config);
	const lintStagedConfig = {};
	const isPrettierEslint = options.includes('prettier-eslint');

	if (options.includes('prettier') || isPrettierEslint) {
		lintStagedConfig['*.{ts,json}'] = 'prettier -w';
	}

	if (options.includes('eslint') || isPrettierEslint) {
		lintStagedConfig['*.ts'] = 'eslint --fix';
	}

	filesManager.add('.lintstagedrc.json', lintStagedConfig);

	const replacement = { '#SCRIPT': 'echo "Good luck with your push <3"' };
	if (options.includes('tests')) {
		replacement['#SCRIPT'] = 'npm test';
	}

	filesManager.replace('.husky/pre-push', replacement);
};

module.exports = { huskyLogic };
