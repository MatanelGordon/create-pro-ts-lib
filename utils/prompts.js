const prompts = require('prompts');
const ErrorWithCode = require('./ErrorWithCode');

const NOOP = () => {};
const CANCELLED_REQUEST = 499;
const promptsWrapper = (questions, onCancel = NOOP, onSubmit = NOOP) => {
    const onCancelWrapper = prompt => {
        onCancel(prompt);
        throw new ErrorWithCode('cancelled prompts', CANCELLED_REQUEST);
    };

    return prompts(questions, { onCancel: onCancelWrapper, onSubmit });
};

module.exports = { promptsWrapper, CANCELLED_REQUEST };
