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

module.exports = Option;