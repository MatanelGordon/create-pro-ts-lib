const FilesManager = require('../utils/FilesManager');
const { createTemplateFilesDownloader } = require('../utils/template');

const TEMPLATE_PATH = 'templates/tsup';

/**
 *
 * @param {FilesManager} filesManager
 * @param {object} config
 */
const tsupLogic = createTemplateFilesDownloader(TEMPLATE_PATH);

module.exports = tsupLogic;
