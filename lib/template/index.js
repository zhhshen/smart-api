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
      resolve('pages') // 替换文件路径
    ]
  },
  api: {
    prefix: 'api',
    output: resolve('config'), // 输入api路径
    alias: 'apiConfig' // api前缀名称，
  }
}