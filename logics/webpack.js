const FilesManager = require('../utils/FilesManager');
const { createTemplateFilesDownloader } = require('../utils/template');

const TEMPLATE_PATH = 'templates/webpack';

/**
 *
 * @param {FilesManager} filesManager
 * @param {object} config
 */
const webpackLogic = createTemplateFilesDownloader(TEMPLATE_PATH);

module.exports = webpackLogic;
