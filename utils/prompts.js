const prompts = require("prompts");
const NOOP = () => {};
const promptsWrapper = (questions, onCancel = NOOP, onSubmit = NOOP) => {
    const onCancelWrapper = prompt => {
        onCancel(prompt);
        throw new Error('cancelled prompts');
    }

    return prompts(questions, {onCancel: onCancelWrapper, onSubmit})
}

module.exports = promptsWrapper;