const _ = require('lodash');
const path = require('path');
const { readdir, readFile, writeFile, mkdir, lstat } = require('fs/promises');
const { existsSync } = require('fs');
const ErrorWithCode = require('./ErrorWithCode');

const parseFile = (filePath, strContent) => {
    let content = strContent;
    if (path.extname(filePath) === '.json') {
        content = JSON.parse(content);
    }
    return content;
};

const stringifyFile = (filePath, content) => {
    let strContent = content;
    if (path.extname(filePath) === '.json') {
        strContent = JSON.stringify(content, null, 4);
    }
    return strContent;
};

const recursiveReadDir = async dirPath => {
    if(!existsSync(dirPath)) return [];
    const entities = await readdir(dirPath);
    const stats = await Promise.all(entities.map(entity => lstat(path.join(dirPath, entity))));
    const files = [];

    await Promise.all(
        _.zip(entities, stats).map(async ([entity, stat]) => {
            if (stat.isDirectory()) {
                const newPath = path.join(dirPath, entity);
                const dirFiles = await recursiveReadDir(newPath);
                const relativeDirFiles = dirFiles.map(file => path.join(entity, file));
                files.push(...relativeDirFiles);
                return;
            }
            files.push(entity);
        })
    );

    return files;
};

const readTemplateFiles = async (templatePath, config = {}) => {
    const filesNames = await recursiveReadDir(templatePath);
    const filesPaths = filesNames.map(name => path.join(templatePath, name));
    const files = await Promise.all(
        _.zip(filesNames, filesPaths).map(async ([name, filePath]) => {
            const contentBuffer = await readFile(filePath);
            const bufferStr = contentBuffer.toString('utf8');
            const content = parseFile(name, bufferStr);

            return {
                name,
                path: filePath,
                content,
            };
        })
    );

    return files.map(item => ({
        ...item,
        name: config?.files?.rename?.[item.name] ?? item.name,
    }));
};

const sortJson = (deepObject, enableSortArrays = true) => {
    if (!deepObject) return {};
    return Object.entries(deepObject)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .reduce((acc, [key, value]) => {
            let newValue = value;

            const isObject = typeof value === 'object';
            const isArray = Array.isArray(value);

            if (isObject && !isArray) {
                newValue = sortJson(value, enableSortArrays);
            } else if (isArray && enableSortArrays) {
                newValue = value.sort((objA, objB) =>
                    JSON.stringify(objA).localeCompare(JSON.stringify(objB))
                );
            }

            return { ...acc, [key]: newValue };
        }, {});
}

const sortPackageJsonObj = (packageJson) => {
    const sortedPackageJson = [
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
        'devDependencies',
    ].reduce((obj, key) => Object.assign(obj, { [key]: packageJson[key] }), {});

    //sort json of specific keys
    ['devDependencies', 'dependencies', 'scripts'].forEach(key => {
        sortedPackageJson[key] = sortJson(packageJson[key]);
    });

    return sortedPackageJson;
}

const DIR_EXISTS_ERROR = 409;
const DEFAULT_OPTIONS = { forceWrite: false };
const createFiles = async (filesManager, { forceWrite } = DEFAULT_OPTIONS)  => {
    const filesEntries = Object.entries(filesManager.files);
    const abortion = new AbortController();
    const signal = abortion.signal;

    const onCancel = () => {
        abortion.abort();
    };

    process.once('SIGINT', onCancel);

    const isDirExists = existsSync(filesManager.path)
    const isDirGoodToHost = isDirExists && (await readdir(filesManager.path)).length === 0;

    if (!isDirGoodToHost && !forceWrite) {
        throw new ErrorWithCode(
            `EEXIST: dir '${path.dirname(filesManager.path)}' already exists`,
            DIR_EXISTS_ERROR
        );
    }

    try {
        if (!isDirExists) {
            await mkdir(filesManager.path, { recursive: true });
        }

        await Promise.all(
            filesEntries.map(async ([filePath, content]) => {
                const strContent = stringifyFile(filePath, content);
                const dirPath = path.dirname(filePath);
                if (!existsSync(dirPath)) {
                    await mkdir(dirPath, { recursive: true });
                }
                await writeFile(filePath, strContent, { signal });
            })
        );
    } catch (e) {
        abortion.abort();

        if (e instanceof ErrorWithCode) {
            throw e;
        }
    }
}

const postProcessFiles = (filesManager) => {
    const packageJson = sortPackageJsonObj(filesManager.get('package.json'));
    const tsconfig = filesManager.get('tsconfig.json');

    filesManager.add('package.json', packageJson, true);
    filesManager.add('tsconfig.json', sortJson(tsconfig), true);
}

const createTemplateFilesDownloader = dirPath => async (filesManager, config) => {
    const fullPath = path.join(__dirname, '../', dirPath);
    const files = await readTemplateFiles(fullPath, config);

    files.forEach(({ name, content }) => {
        filesManager.add(name, content);
    });
};

module.exports = {
    readTemplateFiles,
    postProcessFiles,
    createFiles,
    createTemplateFilesDownloader,
    ERRORS: { DIR_EXISTS_ERROR },
};
