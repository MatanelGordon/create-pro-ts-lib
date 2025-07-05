const path = require('path');
const { promptsWrapper, optionsToPromptsChoices } = require('../../utils/prompts');
const {OptionsCollection} = require("../../utils/options");
const ErrorWithCode = require("../../utils/ErrorWithCode");
const FilesManager = require('../../utils/FilesManager');

const SEPERATED_TESTS_DIR = '__tests__';
const TEST_MODE_INVALID = 'TEST_MODE_INVALID';

const getTestMode = async (testModeFlag, config) => {
	const testModes = new OptionsCollection().addAll(config.testMode);

	if (testModeFlag) {
		const name = testModeFlag.value
		const mode = testModes.findByName(name)
		if(!mode){
			const testModeOptions = testModes.list.map(opt => `"${opt.name}"`).join('|')
			throw new ErrorWithCode(`Invalid test-mode - ${name}, expected ${testModeOptions}`, TEST_MODE_INVALID);
		}
		return mode;
	}

	const { testMode } = await promptsWrapper([
		{
			type: 'select',
			name: 'testMode',
			message: 'Pick tests location',
			choices: optionsToPromptsChoices(config.testMode),
		},
	]);

	return testMode;
};

/**
 * 
 * @param {FilesManager} filesManager 
 */
const separatedLogic = filesManager => {
	Object.keys(filesManager.relativeFiles)
		.filter(path => path.endsWith('.test.ts'))
		.forEach(testPath => {
			const testPathWithoutSrc = testPath.split('/').slice(1).join('/');
			filesManager.change(testPath, path.join(SEPERATED_TESTS_DIR, testPathWithoutSrc));
		});
	
	filesManager.add('tsconfig.test.json', {
		include: [`${SEPERATED_TESTS_DIR}/**/*.test.ts`]
	})
};

/**
 * 
 * @param {FilesManager} filesManager 
 */
const combinedLogic = (filesManager) => {
	filesManager.add('tsconfig.test.json', {
		include: [`src/**/*.test.ts`]
	})

	filesManager.add('tsconfig.json', {
		exclude: [`src/**/*.test.ts`]
	})
}

module.exports = { combinedLogic, separatedLogic, getTestMode, SEPERATED_TESTS_DIR, TEST_MODE_INVALID };
