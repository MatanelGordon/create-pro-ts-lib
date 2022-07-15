const {readTemplateFiles} = require("../utils/template");
const TEMPLATE_PATH = 'templates/nodemon';

const nodemonLogic = async (filesManager, config = {}) => {
    const files = await readTemplateFiles(TEMPLATE_PATH, config);
    console.log(files)
}

module.exports = nodemonLogic;