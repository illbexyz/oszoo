const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    './src/client/index.js',
  ],
  output: {
    path: `${__dirname}/dist/public/javascripts/`,
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      // { test: /\.css$/, loader: 'style!css' },
      {
        test: /.js?$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, './src/client'),
          path.resolve(__dirname, './src/constants'),
        ],
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map',
};
