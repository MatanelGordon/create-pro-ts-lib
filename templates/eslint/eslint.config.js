import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
	tseslint.config(
		eslint.configs.recommended,
		tseslint.configs.recommended,
		tseslint.configs.strict,
		tseslint.configs.stylistic
	),
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: process.cwd(),
			},
		},
	},
];
