const webpack = require('webpack');
const path = require('path');

const DEV = path.resolve(__dirname, '../lib');
const OUTPUT = path.resolve(__dirname, '../out');

module.exports = env => (
  {
    context: DEV,
    entry: {
      index: './index.jsx',
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    output: {
      filename: '[name].web.bundle.js',
      path: OUTPUT,
    },
    module: {
      rules: [
        {
          test: path.resolve(__dirname, '../node_modules/electron/index.js'),
          use: 'null-loader',
        },
        {
          test: /\.jsx$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
          },
        }
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
      }),
      new webpack.DefinePlugin({
        ADMIN: false,
      })
    ],
  }
);

