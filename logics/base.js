const { readTemplateFiles } = require('../utils/template');

const TEMPLATE_PATH = 'templates/base';
const baseLogic = async (fileManager, config, options) => {
    const files = await readTemplateFiles(TEMPLATE_PATH, config);

    files.forEach(({ name, content }) => {
        fileManager.add(name, content);
    });

    const nodeVersion = +process.version.slice(1).split('.')[0];

    const dynamicPackageJson = {
        name: options.name,
        devDependencies: {
            '@types/node': `^${nodeVersion}`,
        },
    };

    fileManager.add('package.json', dynamicPackageJson);
};

module.exports = baseLogic;
