const ErrorWithCode = require("./ErrorWithCode");
const resolveDirectory = argv => {
    const dirs = argv._;
    if (dirs.length > 1) {
        throw new Error(`expected 1 directory, received ${dirs.length} - ${dirs}`);
    }
    return dirs[0].trim();
}

class ArgumentExtractor {
    static ERRORS = {
        MISSING_CONFIG: 403
    }
    static #defaultConfig = {
        options: [],
        flags: []
    }

    #config;

    constructor(config = ArgumentExtractor.#defaultConfig) {
        if (!config?.flags) {
            throw new ErrorWithCode(`no 'flags' key in config`, ArgumentExtractor.ERRORS.MISSING_CONFIG);
        }

        if (!config?.options) {
            throw new ErrorWithCode(`no 'options' key in config`, ArgumentExtractor.ERRORS.MISSING_CONFIG);
        }

        this.#config = config;
    }

    getFlags(argv) {
        return this.#config.flags
            .filter(flag => argv[flag.name])
            .reduce(
                (obj, curr) =>
                    Object.assign(obj, {[curr.name]: curr})
                ,
                {}
            );
    }

    getOptions(argv) {
        return this.#config.options.filter(option => argv[option.name]);
    }
}

module.exports = {
    ArgumentExtractor,
    resolveDirectory
}