const { resolve } = require('path')
const isProductionMode = process.env.NODE_ENV === 'production'

module.exports = {
  entry: resolve(__dirname, 'src/main.js'),
  output: {
    path: resolve(__dirname, 'dist/js'),
    filename: 'main.js',
    clean: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  module: {},
  plugins: [],
  mode: isProductionMode ? 'production' : 'development',
}
