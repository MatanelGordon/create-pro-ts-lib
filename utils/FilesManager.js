const path = require('path');
const deepmerge = require('deepmerge');
const _ = require('lodash');

const merge = (obj1, obj2) =>
	deepmerge(obj1, obj2, {
		arrayMerge(target, source) {
			return _.chain(source).concat(target).uniq().value();
		},
	});

/**
 * A class for handling file system
 * @class FileManager
 */
class FilesManager {
	#files;
	#path;

	/**
	 * Manages File Configurations
	 * @constructor
	 * @param {string} dir - The Directory name
	 */
	constructor(dir) {
		this.#path = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
		this.#files = new Map();
	}

	get files() {
		return Object.fromEntries(
			Array.from(this.#files.entries()).map(([key, value]) => [path.join(this.#path, key), value])
		);
	}

	get relativeFiles() {
		return Object.fromEntries(this.#files.entries());
	}

	/**
	 * @returns {string} the main path
	 */
	get path() {
		return this.#path;
	}


	/**
	 * Adds a file in a smart way. 
	 * It also Allows to merge files if are text files or json files.
	 * @param {string} fileName 
	 * @param {any} value 
	 * @param {boolean} force 
	 * @returns 
	 */
	add(fileName, value, force = false) {
		const isJson = path.extname(fileName) === '.json';
		const isIgnoreFile = /^\.\w+ignore$/.test(path.basename(fileName));
		const currentValue = this.#files.get(fileName);
		let setterValue = value;

		if (!force && isJson) {
			const currentObject = currentValue ?? {};

			if (!(typeof currentObject === 'object' && typeof value === 'object')) {
				throw new Error('Could Not merge if current value or new Value are not typeof object');
			}
			setterValue = merge(currentObject, value);
		} else if (!force && currentValue && isIgnoreFile) {
			setterValue = [currentValue, value].map(content => content.trim()).join('\n');
		}
		this.#files.set(fileName, setterValue);
		return this;
	}

	/**
	 *
	 * @param {string} path
	 * @returns
	 */
	get(path) {
		const content = this.#files.get(path);
		if (typeof content === 'object') {
			return { ...content };
		}
		return content;
	}

	/**
	 *
	 * @param {string} oldPath
	 * @param {string} newPath
	 */
	change(oldPath, newPath) {
		const content = this.get(oldPath);
		this.#files.set(newPath, content);
		this.delete(oldPath);
	}

	/**
	 *
	 * @param {string} path
	 * @param {Record<string, string>} valuesDict
	 * @returns
	 */
	replace(path, valuesDict) {
		const content = this.get(path);
		const regexp = new RegExp(Object.keys(valuesDict).join('|'));
		const newContent = content.replace(regexp, match => valuesDict[match]);
		this.add(path, newContent, true);
		return this;
	}

	/**
	 * @callback JsonModifier
	 * @param {Object} prev
	 * @return {void}
	 */
	/**
	 *
	 * @param {string} path
	 * @param {JsonModifier} modifier
	 */
	modifyJson(path, modifier) {
		if (!this.has(path)) throw new Error('File Does Not Exist in FilesManager');
		if (!path.endsWith('.json')) throw new Error('Could not modify non .json paths');
		const curr = this.get(path);
		modifier(curr);
		this.add(path, curr, true);
	}

	/**
	 *
	 * @param {string} path
	 * @returns {boolean} true if exists, false otherwise
	 */
	has(path) {
		return this.#files.has(path);
	}

    /**
     * 
     * @param {string} path 
     */
	delete(path) {
		this.#files.delete(path);
	}
}

module.exports = FilesManager;
