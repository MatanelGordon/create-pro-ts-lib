const FilesManager = require('../utils/FilesManager');
const { createTemplateFilesDownloader } = require('../utils/template');
const { getTestMode } = require('./flags/test-mode');

const TEMPLATE_PATH = 'templates/tests';
const downloadTemplate = createTemplateFilesDownloader(TEMPLATE_PATH);

/**
 *
 * @param {FilesManager} filesManager
 * @param {*} config
 * @param {*} param2
 */
const testsLogic = async (filesManager, config, { flags }) => {
	await downloadTemplate(filesManager, config);
	const testMode = await getTestMode(flags['test-mode'], config);
	testMode?.logic?.(filesManager, config);
};
module.exports = { testsLogic, TEMPLATE_PATH };
