const path = require('path');
const ErrorWithCode = require('../../utils/ErrorWithCode');
const FilesManager = require('../../utils/FilesManager');
const { SEPERATED_TESTS_DIR } = require('./test-mode');

const DEFAULT_SOURCE_DIR = 'src';
const SRC_DIR_BAD_PARAMS_CODE = 'SRC_DIR_BAD_PARAMS_CODE';
const SRC_DIR_ILLEGAL = 'SRC_DIR_ILLEGAL';

/**
 * @param {FilesManager} filesManager
 * @param {string} srcDir
 * @returns
 */
const srcDirLogic = (filesManager, srcDir) => {
	if (srcDir === DEFAULT_SOURCE_DIR) return;

	if (typeof srcDir !== 'string') {
		throw new ErrorWithCode(`expected "src-dir" to be string but received ${srcDir}`, SRC_DIR_BAD_PARAMS_CODE);
	}

	if (/\s|[#%$^&*()!\/\\{}\[\]+~`"',|]/.test(srcDir)) {
		throw new ErrorWithCode(`"src-dir" should have no spaces or special characters`, SRC_DIR_ILLEGAL);
	}

	Object.keys(filesManager.relativeFiles)
		.filter(path => /^src\//.test(path))
		.forEach(filePath => {
			const pathWithoutSrc = filePath.split('/').slice(1).join('/');
			filesManager.change(filePath, path.join(srcDir, pathWithoutSrc));
		});

	// modify tsconfigs
	filesManager.modifyJson(
		'tsconfig.json',
		/**
		 * @param {{include?:string[], exclude?: string[]}} prev
		 * @returns {string} the modified include/exclude pattern
		 */
		prev => {
			for (const field of ['include', 'exclude']) {
				prev[field] = (prev[field] ?? []).map(pattern => {
					if (pattern.startsWith(DEFAULT_SOURCE_DIR)) {
						const restPath = pattern.split('/').slice(1).join('/');
						return `${srcDir}/${restPath}`;
					}

					return pattern;
				});
			}
		}
	);

	const hasTestTsconfig = filesManager.has('tsconfig.test.json');
	if (hasTestTsconfig) {
		filesManager.modifyJson(
			'tsconfig.test.json',
			/**
			 * @param {{include?: string[]}} prev
			 * @returns {void}
			 */
			prev => {
				prev.include ??= [];

				const hasSeperatedTestModePattern = prev.include.some(pattern =>
					pattern.startsWith(SEPERATED_TESTS_DIR)
				);
				if (hasSeperatedTestModePattern) return;

				prev.include = prev.include
					.filter(pattern => !pattern.startsWith(DEFAULT_SOURCE_DIR))
					.concat(`${srcDir}/**/*.test.ts`);
			}
		);
	}
};

module.exports = { srcDirLogic, DEFAULT_SOURCE_DIR, SRC_DIR_BAD_PARAMS_CODE };
