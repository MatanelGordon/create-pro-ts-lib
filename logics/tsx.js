const { createTemplateFilesDownloader } = require('../utils/template');

const TEMPLATE_PATH = 'templates/tsx';
const tsxLogic = createTemplateFilesDownloader(TEMPLATE_PATH);

module.exports = { tsxLogic, TEMPLATE_PATH };
