const prompts = require('prompts');
const ErrorWithCode = require('./ErrorWithCode');

const NOOP = () => {};
const CANCELLED_REQUEST = 499;

const optionsToPromptsChoices = options =>
	options
		.filter(option => option.visible)
		.map(option => ({
			title: option?.color?.(option.name) ?? option.name,
			selected: option.initialSelected,
			value: option,
		}));

const promptsWrapper = (questions, onCancel = NOOP, onSubmit = NOOP) => {
	const onCancelWrapper = prompt => {
		onCancel(prompt);
		throw new ErrorWithCode('cancelled prompts', CANCELLED_REQUEST);
	};

	return prompts(questions, { onCancel: onCancelWrapper, onSubmit });
};

module.exports = { promptsWrapper, optionsToPromptsChoices, CANCELLED_REQUEST };
