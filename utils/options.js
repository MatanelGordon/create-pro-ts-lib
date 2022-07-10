const toYargsOptionsParam = options => options.reduce((acc, option) => {
    const name = option.name;
    const yargsSettings = option.yargsSettings;
    return {
        ...acc,
        [name]: yargsSettings
    };
}, {})

const optionsToPrompts = (options) => ({
    type: 'multiselect',
    name: 'options',
    message: 'Select your features',
    hint: '- Space to select. Return to submit',
    instructions: false,
    min: 1,
    choices: options
        .filter(option => !option.isFlagOnly)
        .map(option => ({
            title: option.name, selected: option.initialSelected, value: option
        }))
})


/*
Allows extracting options according to argv
 */
class OptionsHandler {
    options;

    constructor(options) {
        this.options = options;
    }

    #getOptionsFromArgv(argv) {
        return this.options.filter(option => argv[option.name]);
    }

    getFlags(argv) {
        const flags = this.#getOptionsFromArgv(argv);
        return flags.filter(option => option.isFlagOnly).reduce((acc, curr) => ({
            ...acc, [curr.name]: curr
        }), {});
    }

    getOptions(argv) {
        const flags = this.#getOptionsFromArgv(argv);
        return flags.filter(option => !option.isFlagOnly);
    }
}

/**
 * Represents an option.
 */
class Option{
    static #initialOptions = {type:'boolean', isFlagOnly: false};

    #yargsSettings = {}
    #name;
    #isFlagOnly;
    #initialSelected;
    #logic = () => {};
    constructor(name, options = {}) {

        const {type, isFlagOnly} = {
            ...Option.#initialOptions,
            ...options
        }

        this.#name = name;
        this.#isFlagOnly = isFlagOnly;
        this.#yargsSettings.type = type;
        this.#initialSelected = true;
    }

    get yargsSettings(){
        return this.#yargsSettings;
    }

    get name(){
        return this.#name;
    }

    get logic(){
        return this.#logic;
    }

    get isFlagOnly(){
        return this.#isFlagOnly;
    }

    get initialSelected(){
        return this.#initialSelected;
    }

    setAlias(alias){
        this.#yargsSettings.alias = alias;
        return this;
    }

    setInitialSelected(isSelected){
        this.#initialSelected = isSelected;
        return this;
    }

    setDescription(value){
        this.#yargsSettings.describe = value;
        return this;
    }

    setLogic(logicFunc){
        this.#logic = logicFunc;
        return this;
    }

    toString(){
        return `Option{ ${this.name} }`
    }
}

module.exports = {optionsToPrompts, toYargsOptionsParam, OptionsHandler, Option};