const _ = require('lodash');
const path = require("path");
const {sortJson} = require("./template");

class FilesManager{
    #files;
    #path;
    #config;

    /*
    Manages File Configurations
    @constructor
    @param {string} dir - The Directory name
    @param {object} config
     */
    constructor(dir, config) {
        this.#path = path.isAbsolute(dir)? dir:path.join(__dirname, dir);
        this.#files = new Map();
        this.#config = config;
    }

    get files(){
        return Object.fromEntries(Array.from(this.#files.entries()).map(([key, value]) => [path.join(this.#path, key),value]));
    }

    /*
    Receives  relative path and merges it with existing configuration
    @param {string} path - The relative path in the project (e.g. `pacage.json` for package.json)
    @param {object} object - json object to merge with existing configuration
    @returns the current instance to allow chaining
     */
    add(fileName, value, force=false){
        const isJson = path.extname(fileName) === '.json'
        const isIgnoreFile = /^\.\w+ignore$/.test(path.basename(fileName));
        const currentValue = this.#files.get(fileName);
        let setterValue = value;

        if(!force && isJson){
            const currentObject = currentValue ?? {};

            if(!(typeof currentObject === "object" && typeof value === "object")){
                throw new Error('Could Not merge if current value or new Value are not typeof object');
            }
            setterValue = _.merge(currentObject, value);
        }
        else if(!force && currentValue && isIgnoreFile){
            setterValue = [currentValue, value]
                .map(content => content.trim())
                .join('\n');
        }

        console.log('added', fileName);
        this.#files.set(fileName, setterValue);
        return this;
    }

    has(path){
        return this.#files.has(path);
    }

    get(filename){
        return this.#files.get(filename);
    }
}

module.exports = FilesManager;