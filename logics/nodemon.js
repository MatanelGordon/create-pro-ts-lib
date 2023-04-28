const path = require('path');
const { createTemplateFilesDownloader } = require('../utils/template');

const TEMPLATE_PATH = 'templates/nodemon';
const downloadNodemon = createTemplateFilesDownloader(TEMPLATE_PATH);

const nodemonLogic = async (filesManager, config) => {
    await downloadNodemon(filesManager, config);
    const dev = 'nodemon src/index.ts';
    filesManager.add('package.json', { scripts: { dev } });
};

module.exports = { nodemonLogic, TEMPLATE_PATH };
