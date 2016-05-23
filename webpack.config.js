module.exports = {  
  entry: './ts/main.ts',
  output: {
    filename: './js/generated/bundle.js'
  },
  worker: {
    output: {
      filename: './js/generated/[name].worker.js',
      chunkFilename: './js/generated/[name].worker.js'
    }
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
}