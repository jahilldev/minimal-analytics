import { Configuration, DefinePlugin } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import * as path from 'path';

/* -----------------------------------
 *
 * Output
 *
 * -------------------------------- */

const outputFiles = [
  // { target: 'es5', filename: '[name].es5.js' },
  { target: 'es2018', filename: '[name].js' },
];

/* -----------------------------------
 *
 * Default
 *
 * -------------------------------- */

const defaultConfig = {
  entry: {
    index: path.join(__dirname, './src/index.ts'),
  },
  externals: [nodeExternals({ allowlist: ['@minimal-analytics/shared'] })],
  context: path.join(__dirname, './src'),
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    globalObject: 'this',
    chunkFormat: 'commonjs',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', 'json'],
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  stats: {
    colors: true,
    timings: true,
  },
};

/* -----------------------------------
 *
 * Config
 *
 * -------------------------------- */

const config = ({ mode }): Configuration[] =>
  outputFiles.map(({ target, filename, ...config }) => ({
    ...defaultConfig,
    mode: 'production',
    target,
    devtool: mode === 'development' ? 'eval-source-map' : void 0,
    cache: mode === 'development',
    output: {
      ...defaultConfig.output,
      filename,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  target,
                },
              },
            },
          ],
        },
        {
          test: /\.m?js$/,
          use: {
            loader: 'babel-loader',
            options: {
              ...(target === 'es5' && { presets: ['@babel/preset-env'] }),
            },
          },
        },
      ],
    },
    performance: {
      hints: mode === 'development' ? 'warning' : void 0,
    },
    plugins: [
      new DefinePlugin({
        __DEV__: mode === 'development',
      }),
    ],
    optimization: {
      usedExports: true,
      mergeDuplicateChunks: true,
      moduleIds: 'deterministic',
    },
    ...config,
  }));

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

module.exports = config;
