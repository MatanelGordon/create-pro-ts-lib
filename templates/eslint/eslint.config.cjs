import plugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser,
		},
		plugins: {
			'@typescript-eslint': plugin,
		},
		rules: {
			...plugin.configs.recommended.rules,
		},
	},
];
