const _ = require("lodash");
const path = require("path");
const {readdir, readFile, writeFile, mkdir} = require("fs/promises");
const {existsSync} = require("fs");

const parseFile = (filePath, strContent) => {
    let content = strContent;
    if (path.extname(filePath) === '.json') {
        content = JSON.parse(content);
    }
    return content;
}

const stringifyFile = (filePath, content) => {
    let strContent = content;
    if (path.extname(filePath) === '.json') {
        strContent = JSON.stringify(content, null, 4);
    }
    return strContent;
}

const readTemplateFiles = async (templatePath, config = {}) => {
    const filesNames = await readdir(templatePath);
    const filesPaths = filesNames.map(name => path.join(templatePath, name));
    const files = await Promise.all(_.zip(filesNames, filesPaths).map(async ([name, filePath]) => {
        const contentBuffer = await readFile(filePath);
        const bufferStr = contentBuffer.toString('utf8');
        const content = parseFile(name, bufferStr);

        return {
            name, path: filePath, content
        };
    }))

    return files.map(item => (
        {
            ...item, name: config?.files?.rename?.[item.name] ?? item.name
        }
    ))
}

function sortJson(deepObject) {
    if (!deepObject) return {};
    return Object.entries(deepObject)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .reduce((acc, [key, value]) => (
            {
                ...acc, [key]: typeof value === "object" ? sortJson(value) : value
            }
        ), {})
}

function sortPackageJsonObj(packageJson) {
    return [
        '$schema',
        'name',
        'version',
        'description',
        'private',
        'main',
        'scripts',
        'repository',
        'keywords',
        'author',
        'licence',
        'bugs',
        'homepage',
        'dependencies',
        'devDependencies'
    ].reduce(
        (obj, key) => Object.assign(obj, {[key]: packageJson[key]}),
        {}
    )
}

// todo: make it to create the files themselves [ongoing]
async function createFiles(filesManager) {
    const filesEntries = Object.entries(filesManager.files);
    const abortion = new AbortController();
    const signal = abortion.signal;

    const onCancel = () => {
        abortion.abort();
    }

    process.once('SIGINT', onCancel);
    console.log(`path: ${filesManager.path}`)

    try {
        if (existsSync(filesManager.path)) {
            console.error(`ERROR! ${filesManager.path} already exists!`);
        }

        await mkdir(filesManager.path, {recursive: true});
        await Promise.all(
            filesEntries.map(([path, content]) => {
                const strContent = stringifyFile(path, content);
                return writeFile(path, strContent, {signal})
            })
        )
    } catch (e) {
        abortion.abort();
    }

    console.log('ENJOY!')
}

async function postProcessFiles(filesManager) {
    const packageJson = sortPackageJsonObj({...filesManager.get('package.json')});
    const tsconfig = filesManager.get('tsconfig.json');

    const keysToSort = ['devDependencies', 'dependencies', 'scripts'];

    for (const key of keysToSort) {
        packageJson[key] = sortJson(packageJson[key]);
    }

    filesManager.add('package.json', packageJson, true);
    filesManager.add('tsconfig.json', sortJson(tsconfig), true);
    await createFiles(filesManager);
}

const createTemplateFilesDownloader = path => async (filesManager, config) => {
    const files = await readTemplateFiles(path, config);

    files.forEach(({name, content}) => {
        filesManager.add(name, content);
    })
}

module.exports = {
    readTemplateFiles, postProcessFiles, createTemplateFilesDownloader,
}