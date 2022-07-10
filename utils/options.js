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

module.exports = {optionsToPrompts, toYargsOptionsParam, OptionsHandler};