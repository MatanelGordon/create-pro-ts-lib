const path = require('path');
const deepmerge = require('deepmerge');
const _ = require('lodash');

const merge = (obj1, obj2) =>
    deepmerge(obj1, obj2, {
        arrayMerge(target, source) {
            return _.chain(source).concat(target).uniq().value();
        },
    });

class FilesManager {
    #files;
    #path;

    /*
    Manages File Configurations
    @constructor
    @param {string} dir - The Directory name
    @param {object} config -  App configuration
     */
    constructor(dir) {
        this.#path = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
        this.#files = new Map();
    }

    get files() {
        return Object.fromEntries(
            Array.from(this.#files.entries()).map(([key, value]) => [
                path.join(this.#path, key),
                value,
            ])
        );
    }

    get relativeFiles() {
        return Object.fromEntries(this.#files.entries());
    }

    get path() {
        return this.#path;
    }

    /*
    Receives  relative path and merges it with existing configuration
    @param {string} path - The relative path in the project (e.g. `pacage.json` for package.json)
    @param {object} object - json object to merge with existing configuration
    @returns the current instance to allow chaining
     */
    add(fileName, value, force = false) {
        const isJson = path.extname(fileName) === '.json';
        const isIgnoreFile = /^\.\w+ignore$/.test(path.basename(fileName));
        const currentValue = this.#files.get(fileName);
        let setterValue = value;

        if (!force && isJson) {
            const currentObject = currentValue ?? {};

            if (!(typeof currentObject === 'object' && typeof value === 'object')) {
                throw new Error(
                    'Could Not merge if current value or new Value are not typeof object'
                );
            }
            setterValue = merge(currentObject, value);
        } else if (!force && currentValue && isIgnoreFile) {
            setterValue = [currentValue, value].map(content => content.trim()).join('\n');
        }
        this.#files.set(fileName, setterValue);
        return this;
    }

    get(path) {
        const content = this.#files.get(path);
        if (typeof content === 'object') {
            return { ...content };
        }
        return content;
    }

    change(oldPath, newPath) {
        const content = this.get(oldPath);
        this.#files.set(newPath, content);
        this.delete(oldPath);
    }

    replace(path, valuesDict){
        const content = this.get(path);
        const regexp = new RegExp(Object.keys(valuesDict).join('|'));
        const newContent = content.replace(regexp, match => valuesDict[match]);
        this.add(path, newContent, true);
        return this;
    }

    delete(path){
        this.#files.delete(path);
    }
}

module.exports = FilesManager;
