import plugin from '@typescript-prettier-eslint';

export default [
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: plugin.parser,
		},
		plugins: {
			'@typescript-prettier-eslint': plugin,
		},
		rules: {
			...plugin.configs.recommended.rules,
		},
	},
];
