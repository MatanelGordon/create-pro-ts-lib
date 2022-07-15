const {readTemplateFiles} = require("../utils/template");

const TEMPLATE_PATH = 'templates/base';
const baseLogic = async (fileManager, config) => {
    const files = await readTemplateFiles(TEMPLATE_PATH, config);
    Object.entries(files).forEach(([name, content]) => {
        fileManager.add(name, content);
    })
}

module.exports = baseLogic;