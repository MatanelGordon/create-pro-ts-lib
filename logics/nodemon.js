const {readTemplateFiles} = require("../utils/template");
const TEMPLATE_PATH = 'templates/nodemon';

const nodemonLogic = async (filesManager, config = {}) => {
    const files = await readTemplateFiles(TEMPLATE_PATH, config);

    for (const {name, content} of files) {
        filesManager.add(name, content);
    }
    console.log(filesManager.files)
}

module.exports = nodemonLogic;