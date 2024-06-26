const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.glsl$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'raw-loader',
            options: {
              esModule: false,
            }
          }
        ]
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  watchOptions: {
    ignored: [ '**/node_modules'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Snake Maze',
      template: './src/index.html'
    })
  ],
  watch: true
};