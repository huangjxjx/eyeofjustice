const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8088,     // 设置开发服务器端口为8088
    host: '0.0.0.0',
    open: true      // 自动打开浏览器
  },
  lintOnSave: false   // 取消 eslint 验证
})
