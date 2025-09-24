const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 5002,
    host: '0.0.0.0',
    allowedHosts: 'all',
    historyApiFallback: true
  },
  configureWebpack: {
    devtool: 'source-map'
  }
})