const path = require('path');
const { promptsWrapper, optionsToPromptsChoices } = require('../../utils/prompts');
const {OptionsCollection} = require("../../utils/options");
const ErrorWithCode = require("../../utils/ErrorWithCode");

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

const seperatedLogic = filesManager => {
	Object.keys(filesManager.relativeFiles)
		.filter(path => /\.test\.ts$/.test(path))
		.forEach(testPath => {
			const testPathWithoutSrc = testPath.split('/').slice(1).join('/');
			filesManager.change(testPath, path.join(SEPERATED_TESTS_DIR, testPathWithoutSrc));
		});
};

module.exports = { seperatedLogic, getTestMode, SEPERATED_TESTS_DIR, TEST_MODE_INVALID };
