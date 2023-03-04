const path = require('path');
var webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  mode: 'development',
  entry: './src/index.js',
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new HtmlWebpackPlugin({
      title: 'Graph Explorer Edit Demo',
      template: path.join(__dirname, 'src', 'template.ejs')
    })
  ],

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      "stream": false,
      "util": require.resolve('util'),
      "http": false,
      "https": false,
      "url": false,
      "crypto": false
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'explorer.js'
  },
  devServer: {
    //contentBase: './dist',
    port: 8088
  },
  module: {
    rules: [
      {
        test: /\.ts$|\.tsx$/,
        loader: 'ts-loader',
        options: { allowTsInNodeModules: true }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      { test: /\.ttl$/, use: ['raw-loader'] },
    ],

  },
};