module.exports = {
	root: true,
	settings: {
		react: {
			version: 'detect',
		},
	},
	env: {},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
	],
	plugins: ['@typescript-eslint', 'prettier', 'react', 'react-hooks'],
	rules: {
		'prettier/prettier': 'warn',
	},
};
