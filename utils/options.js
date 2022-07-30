const _ = require('lodash');
const chalk = require('chalk');

const toYargsOptionsParam = options =>
    options.reduce((acc, option) => {
        const name = option.name;
        const yargsSettings = option.yargsSettings;
        return Object.assign(acc, { [name]: yargsSettings });
    }, {});

const optionsToPrompts = options => ({
    type: 'multiselect',
    name: 'options',
    message: 'Select your features',
    hint: '- Space to select. Return to submit',
    instructions: false,
    min: 1,
    choices: options
        .filter(option => option.visible)
        .map(option => ({
            title: option?.color?.(option.name) ?? option.name,
            selected: option.initialSelected,
            value: option,
        })),
});

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
                throw new Error('inserted Option that is not of type Option');
            }
            if (!this.#options.find(option0 => option0.name === option.name)) {
                this.#options.push(option);
            }
        }
        return this;
    }

    addAll(options) {
        if (Array.isArray(options)) {
            this.add(...options);
        }
        return this;
    }

    remove(option) {
        const name = typeof option === 'string' ? option : option.name;
        _.remove(this.#options, option => option.name === name);
        return this;
    }

    #isOptionInList(option) {
        if (option instanceof Option) {
            return this.#options.includes(option);
        } else if (typeof option === 'string') {
            return !!this.#options.find(item => item.name === option || item.alias === option);
        }
        throw new Error(`parameter "option" doesnt have a valid type: ${typeof option}`);
    }

    includes(...options) {
        return options.reduce((acc, curr) => acc && this.#isOptionInList(curr), true);
    }

    findByName(name) {
        return this.#options.find(opt => opt.name === name);
    }
}

/**
 * Represents an option.
 */

class Option {
    static #initialOptions = { type: 'boolean', visible: true };

    #yargsSettings = {};
    #name;
    #initialSelected;
    #logic;
    #visible;
    #color;

    constructor(name, options = {}) {
        const { type, visible, color } = {
            ...Option.#initialOptions,
            ...options,
        };

        this.#name = name;
        this.#yargsSettings.type = type;
        this.#visible = visible;
        this.#color = color;
        this.#initialSelected = true;
    }

    get yargsSettings() {
        return this.#yargsSettings;
    }

    get name() {
        return this.#name;
    }

    get logic() {
        if (!this.#logic) {
            throw new Error(
                `Logic not implemented in ${this.name}. Use option.setLogic(cb) to prevent this error.`
            );
        }
        return this.#logic;
    }

    get initialSelected() {
        return this.#initialSelected;
    }

    get visible() {
        return this.#visible;
    }

    get color() {
        return this.#color;
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

    setDefaultValue(value) {
        this.#yargsSettings.default = value;
        return this;
    }

    setLogic(logicFunc) {
        this.#logic = logicFunc;
        return this;
    }

    setColor(color) {
        let colorValue = color;

        if (typeof color === 'string' && color.charAt(0) === '#') {
            colorValue = chalk.hex(color);
        } else if (typeof color !== 'function') {
            throw new Error('Color must be a chalk or kolorist color');
        }

        this.#color = colorValue;
        return this;
    }

    toString() {
        return `Option{ ${this.name} }`;
    }
}

module.exports = {
    optionsToPrompts,
    toYargsOptionsParam,
    Option,
    OptionsCollection,
};
