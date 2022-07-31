const nameLogic = async (fileManager, config, { name }) => {
    fileManager.add('package.json', { name });
};

module.exports = nameLogic;
