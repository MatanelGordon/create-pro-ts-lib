const _ = require("lodash");
const path = require("path");
const {readdir, readFile} = require("fs/promises");

const readTemplateFiles = async (templatePath, config = {}) => {
    const filesNames = await readdir(templatePath);
    const filesPaths = filesNames.map(name => path.join(templatePath, name));
    const files = await Promise.all(_.zip(filesNames, filesPaths).map(async ([name, filePath]) => {
        const contentBuffer = await readFile(filePath);
        let content = contentBuffer.toString('utf8');

        if (path.extname(name) === '.json') {
            content = JSON.parse(content);
        }

        return {
            name,
            path: filePath,
            content
        };
    }))

    return files.map(item =>
        ({
            ...item,
            name: config?.files?.rename?.[item.name] ?? item.name
        })
    )
}

function sortJson(deepObject) {
    if(!deepObject) return {};
    return Object.entries(deepObject)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .reduce(
            (acc, [key, value]) => ({
                ...acc,
                [key]: typeof value === "object" ? sortJson(value) : value
            }),
            {}
        )
}

function postProcessFiles(filesManager){
    const packageJson = {...filesManager.get('package.json')};
    const tsconfig = filesManager.get('tsconfig.json');

    const keysToSort = ['devDependencies', 'dependencies', 'scripts'];

    for (const key of keysToSort) {
        packageJson[key] = sortJson(packageJson[key]);
    }

    filesManager.add('package.json', packageJson, true);
    filesManager.add('tsconfig.json', sortJson(tsconfig), true);
}

const createTemplateFilesDownloader = path => async (filesManager, config) => {
    const files = await readTemplateFiles(path, config);

    files.forEach(({name, content}) => {
        filesManager.add(name, content);
    })
}

module.exports = {
    readTemplateFiles,
    sortJson,
    postProcessFiles,
    createTemplateFilesDownloader,
}