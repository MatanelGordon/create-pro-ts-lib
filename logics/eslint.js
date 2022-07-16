const {createTemplateFilesDownloader} = require("../utils/template");

const TEMPLATE_PATH = 'templates/eslint';
const eslintLogic = createTemplateFilesDownloader(TEMPLATE_PATH);

module.exports = {eslintLogic, TEMPLATE_PATH};