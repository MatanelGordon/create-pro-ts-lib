const _ = require("lodash");

const toYargsOptionsParam = options => options.reduce((acc, option) => {
    const name = option.name;
    const yargsSettings = option.yargsSettings;
    return {
        ...acc, [name]: yargsSettings
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
        this.options = new OptionsCollection().addAll(options);
    }

    #getOptionsFromArgv(argv) {
        return Object
            .entries(argv)
            .filter(([arg]) => this.options.includes(arg))
            .map(([name, value]) => ({
                name,
                argValue: value,
                option: this.options.getByName(name)
            }))
    }

    getFlags(argv) {
        const flags = this.#getOptionsFromArgv(argv);
        return flags.filter(({option}) => option.isFlagOnly).reduce((acc, curr) => ({
            ...acc, [curr.name]: curr
        }), {});
    }

    getOptions(argv) {
        const flags = this.#getOptionsFromArgv(argv);
        return flags.filter(({option}) => !option.isFlagOnly);
    }
}

/*
handles collections for options
 */
class OptionsCollection {
    #options = [];

    get list() {
        return this.#options;
    }

    add(...options) {
        for (const option of options) {
            if (!option instanceof Option) {
                throw new Error('inserted Option that is not of type Option')
            }
            if (!this.#options.find(option0 => option0.name === option.name)) {
                this.#options.push(option);
            }
        }
        return this;
    }

    addAll(options) {
        this.add(...options);
        return this;
    }

    remove(option) {
        const name = typeof option === "string" ? option : option.name;
        _.remove(this.#options, option => option.name === name);
        return this;
    }

    includes(option) {
        if (option instanceof Option) {
            return this.#options.includes(option);
        } else if (typeof option === 'string') {
            return !!this.#options.find(item => item.name === option || item.alias === option);
        }
        throw new Error(`parameter "option" doesnt have a valid type: ${typeof option}`);
    }

    includesAll(...options) {
        return options.length !== 0 && options.reduce((acc, curr) => acc && this.includes(curr), true);
    }

    getByName(name) {
        return this.#options.find(option => option.name === name);
    }
}

/**
 * Represents an option.
 */

class Option {
    static #initialOptions = {type: 'boolean', isFlagOnly: false};

    #yargsSettings = {}
    #name;
    #isFlagOnly;
    #initialSelected;
    #logic

    constructor(name, options = {}) {

        const {type, isFlagOnly} = {
            ...Option.#initialOptions, ...options
        }

        this.#name = name;
        this.#isFlagOnly = isFlagOnly;
        this.#yargsSettings.type = type;
        this.#initialSelected = true;
    }

    get yargsSettings() {
        return this.#yargsSettings;
    }

    get name() {
        return this.#name;
    }

    get logic() {
        if(!this.#logic){
            throw new Error(`Logic not implemented in ${this.name}. Use option.setLogic(cb) to prevent this error.`)
        }
        return this.#logic;
    }

    get isFlagOnly() {
        return this.#isFlagOnly;
    }

    get initialSelected() {
        return this.#initialSelected;
    }

    setAlias(alias) {
        this.#yargsSettings.alias = alias;
        return this;
    }

    setInitialSelected(isSelected) {
        this.#initialSelected = isSelected;
        return this;
    }

    setDescription(value) {
        this.#yargsSettings.describe = value;
        return this;
    }

    setLogic(logicFunc) {
        this.#logic = logicFunc;
        return this;
    }

    toString() {
        return `Option{ ${this.name} }`
    }
}

module.exports = {
    optionsToPrompts, toYargsOptionsParam, OptionsHandler, Option, OptionsCollection
};