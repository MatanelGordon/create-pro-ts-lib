const {createTemplateFilesDownloader} = require("../utils/template");

const TEMPLATE_PATH = 'templates/tests';
const testsLogic = createTemplateFilesDownloader(TEMPLATE_PATH);

module.exports = testsLogic;
