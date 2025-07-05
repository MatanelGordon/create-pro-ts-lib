const nameLogic = async (fileManager, _config, { name }) => {
	fileManager.add('package.json', { name });
};

module.exports = nameLogic;
