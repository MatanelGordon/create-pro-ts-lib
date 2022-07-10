const path = require("path");
const {readdir, readFile} = require("fs/promises");
const _ = require("lodash");

const readTemplateFiles = async (templatePath, config = {}) => {
    const filesNames = await readdir(templatePath);
    const filesPaths = filesNames.map(name => path.join(templatePath, name));
    const files = await Promise.all(_.zip(filesNames, filesPaths).map(async ([name, filePath]) => {
        let content = await readFile(filePath);

        if (path.extname(name) === '.json') {
            content = JSON.parse(content.toString('utf8'))
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