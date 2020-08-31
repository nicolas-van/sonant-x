const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'sonantx.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sonantx.bundle.js',
    library: 'sonantx',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
  }
}
