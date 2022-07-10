const _ = require('lodash');
const path = require("path");

class FilesManager{
    #files;
    #path;
    #config;

    /*
    Manages File Configurations
    @constructor
    @param {string} dir - The Directory name
    @param {object} config - FileManager's configuration
     */
    constructor(dir, config) {
        this.#path = path.join(__dirname, dir);
        this.#files = new Map();
        this.#config = config;
    }

    get files(){
        return _.mapKeys(this.#files, key => path.join(this.#path, key))
    }

    /*
    Receives  relative path and merges it with existing configuration
    @param {string} path - The relative path in the project (e.g. `pacage.json` for package.json)
    @param {object} object - json object to merge with existing configuration
    @returns the current instance to allow chaining
     */
    add(path, value, shouldMerge = false){
        if(shouldMerge){
            const currentObject = this.#files.get(path) ?? {};

            if(typeof currentObject === "object" && typeof value === "object"){
                throw new Error('Could Not merge if current value or new Value are not typeof object');
            }

            this.#files.set(path, _.merge(currentObject, value));
        }
        else{
            this.#files.set(path, value);
        }

        return this;
    }

    has(path){
        return this.#files.has(path);
    }
}

module.exports = FilesManager;