const cliSpinners = require("cli-spinners");
const ErrorWithCode = require("./ErrorWithCode");

class Loader {
    static ERRORS = {
        notInitialized: 234,
        notStartedError: 123
    }
    #loaderInstance;

    async init() {
        const ora = (
            await import('ora')
        ).default;
        this.#loaderInstance = ora(cliSpinners.bounce);
        return this;
    }

    #validate() {
        if (!this.#loaderInstance) {
            throw new ErrorWithCode(`Can't start() if not initialized. call init()`, Loader.ERRORS.notInitialized);
        }
    }

    start() {
        this.#validate();
        this.#loaderInstance.start();
    }

    stop() {
        this.#validate();
        this.#loaderInstance.stop();
    }

    setText(text) {
        this.#loaderInstance.text = text;
    }

    async wrapPromise(promise, text, preventStop = false) {
        this.#validate();

        if (!text) {
            this.setText(text);
        }

        this.start();

        await promise;

        if (!preventStop) {
            this.stop();
        }
    }
}

module.exports = Loader;