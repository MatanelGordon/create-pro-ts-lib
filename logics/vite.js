const FilesManager = require("../utils/FilesManager");
const { createTemplateFilesDownloader } = require('../utils/template');

const TEMPLATE_PATH = 'templates/vite';

/**
 * 
 * @param {FilesManager} filesManager 
 * @param {object} config
 */
const viteLogic = createTemplateFilesDownloader(TEMPLATE_PATH)

module.exports = viteLogic;