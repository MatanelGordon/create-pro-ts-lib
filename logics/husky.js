const {createTemplateFilesDownloader} = require("../utils/template");
const downLoadHusky = createTemplateFilesDownloader('templates/husky');

const huskyLogic = async (filesManager, config, {options}) => {
    await downLoadHusky(filesManager, config);
    const lintStagedConfig = {};
    const isPrettierEslint = options.includes("prettier-eslint");

    if(options.includes("prettier") || isPrettierEslint){
        lintStagedConfig["*.{ts,json}"] = "prettier -w"
    }

    if(options.includes("eslint") || isPrettierEslint){
        lintStagedConfig["*.{ts}"] = "eslint --fix"
    }

    filesManager.add('.lintstagedrc.json', lintStagedConfig);

    const replacement = {"#SCRIPT":'echo "Good luck with your push <3"'};
    if(options.includes("tests")){
        replacement["#script"] = "npm test";
    }

    filesManager.replace('.husky/pre-push', replacement);
}

module.exports = {huskyLogic};