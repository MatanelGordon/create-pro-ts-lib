const path = require('path');
const { createTemplateFilesDownloader } = require('../utils/template');
const { DEFAULT_SOURCE_DIR } = require('./src-dir');

const TEMPLATE_PATH = 'templates/nodemon';
const downloadNodemon = createTemplateFilesDownloader(TEMPLATE_PATH);

const nodemonLogic = async (filesManager, config, { flags }) => {
    await downloadNodemon(filesManager, config);
    const srcDir = flags['src-dir']?.value ?? DEFAULT_SOURCE_DIR;
    const dev = `nodemon ${path.join(srcDir, 'index.ts')}`;
    filesManager.add('package.json', { scripts: { dev } });
};

module.exports = { nodemonLogic, TEMPLATE_PATH };
