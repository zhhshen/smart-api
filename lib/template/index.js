const path = require('path')
const resolve = (pwd = '') => {
  return path.resolve(__dirname, pwd)
}
module.exports = {
  mock: {
    extensions: ['js', 'json'], // mock文件后缀名
    path: resolve('mock'), // mock文件夹目录
  },
  source: {
    extensions: ['vue'], // 替换文件后缀名
    path: [
      resolve('pages') // 需替换文件，可包含多个
    ]
  },
  api: {
    prefix: 'api', // api前缀名称，例如const url = api.getList
    output: resolve('config'), // 输出aapi配置文件文件路径，默认是项目根目录下的config文件夹，需根据项目结构修改
    alias: 'apiConfig' // api配置文件文件名
  }
}