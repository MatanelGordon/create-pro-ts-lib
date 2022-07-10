const {readTemplateFiles} = require("../utils/template");

const TEMPLATE_PATH = 'templates/eslint';
async function eslintLogic(fileManager, config = {}){
    const files = await readTemplateFiles(TEMPLATE_PATH, config);
    console.log(files);

}

module.exports = eslintLogic;