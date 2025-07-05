class ErrorWithCode extends Error {
	#code;
	constructor(msg, code) {
		super(msg);
		this.#code = code;
	}

	get code() {
		return this.#code;
	}
}

module.exports = ErrorWithCode;
