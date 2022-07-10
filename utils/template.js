const path = require("path");
const {readdir, readFile} = require("fs/promises");
const _ = require("lodash");

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

    return files.reduce(
        (acc, curr) => {
            const fileName = config?.files?.rename?.[curr.name] ?? curr.name
            return {
                ...acc,
                [fileName]: curr.content
            }
        },
        {}
    );
}

module.exports = {
    readTemplateFiles
}