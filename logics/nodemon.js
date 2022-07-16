const {createTemplateFilesDownloader} = require("../utils/template");
const TEMPLATE_PATH = 'templates/nodemon';

const nodemonLogic = createTemplateFilesDownloader(TEMPLATE_PATH);

module.exports = {nodemonLogic, TEMPLATE_PATH};