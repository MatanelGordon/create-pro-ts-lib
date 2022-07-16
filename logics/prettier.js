const {createTemplateFilesDownloader} = require("../utils/template");

const TEMPLATE_PATH = 'templates/prettier';
const prettierLogic = createTemplateFilesDownloader(TEMPLATE_PATH);

module.exports = {prettierLogic, TEMPLATE_PATH};