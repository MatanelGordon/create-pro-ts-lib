import path from 'path';
import fs from 'fs';

const pkg = fs.readFileSync('./package.json');
const tsconfig = fs.readFileSync('./tsconfig.json');

const alias = Object.fromEntries(
	Object.entries(tsconfig?.compilerOptions?.paths ?? {}).map(
		([name, [pattern]]) => [name, path.resolve(pattern)]
	)
);

/**
 * @type {string | undefined}
 */
const NODE_ENV = process.env['NODE_ENV'];

/**
 * @type {string}
 */
const OUT_DIR = 'dist';


/**
 * @type {import("webpack").Configuration}
 */
const baseConfig = {
	mode: 'production',
	devtool: NODE_ENV === 'development' ? 'source-map' : undefined,
	entry: './src/index.ts',
	experiments: {
		outputModule: true,
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'esbuild-loader',
				options: {
					target: 'esnext',
				},
			},
		],
	},
	resolve: {
		alias,
		extensions: ['.ts', '.tsx', '.js', '...'],
		modules: ['node_modules'],
	},
	externals: Object.keys({
		...pkg.dependencies,
		...pkg.peerDependencies,
	}).reduce((acc, dep) => ({ ...acc, [dep]: dep }), {}),
};

/**
 * @type {import("webpack").Configuration}
 */
const commonJsConfig = {
	...baseConfig,
	name: 'commonjs',
	output: {
		path: path.resolve(OUT_DIR),
		filename: 'index.js',
		library: {
			type: 'commonjs2',
		},
	},
};

/**
 * @type {import("webpack").Configuration}
 */
const esmConfig = {
	...baseConfig,
	name: 'esm',
	output: {
		path: path.resolve(OUT_DIR),
		filename: 'index.esm.js',
		module: true,
		library: {
			type: 'module',
		},
		environment: {
			module: true,
		},
	},
};

export default [commonJsConfig, esmConfig];
