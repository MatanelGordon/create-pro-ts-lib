const process = require('process');

function detectPackageManager(argv = process.argv) {
	const exec = process.env['npm_config_user_agent'] || argv[1] || '';

	if (exec.startsWith('pnpm')) return 'pnpm';
	if (exec.startsWith('yarn')) return 'yarn';
	if (exec.startsWith('npm')) return 'npm';

	return 'npm';
}

function detectPackageManagerVersion(argv = process.argv) {
	const exec = process.env['npm_config_user_agent'] || argv[1] || '';
	const versionMatch = exec.match(/(?:pnpm|yarn|npm)\/(\d+\.\d+\.\d+)/);

	if (versionMatch) {
		return versionMatch[1];
	}

	return null;
}

function createScriptString(scriptName, {cli} ) {
	const pm = detectPackageManager();
    const shorthandScripts = ['start', 'test'];

	let result = cli?.(pm) ?? pm;  

	if (pm === 'npm' && !shorthandScripts.includes(scriptName)) {
		result += ' run';
	}

	result += ` ${scriptName}`;
	return result;
}

module.exports = {
	detectPackageManager,
	detectPackageManagerVersion,
	createScriptString,
};
