### Smart Api
---

#### 描述

```
根据项目中的mock数据，生成apiConfig文件，并自动替换指定文件中的api, 同时可以撤销相应的操作
```

#### 安装

```bash
npm install sapis-cli -g
```

#### 配置项

```
命令：
  sapis init [name]  初始化配置文件
  sapis replace      替换api
  sapis unreplace    撤销替换
  sapis clean        清空文件

选项：
  --version, -V  显示版本号                                               [布尔]
  --help, -h     显示帮助信息                                             [布尔]
```

### 使用

1 初始化配置文件

```
sapis init
```
该命令会在项目根目录下生成sapisConf.js文件，内容如下：

```
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
```
根据项目修改相应的配置文件

2 执行替换操作

```
sapis replace
```
执行后会生成sapisConf.log文件, 可根据log文件，再次确认替换文件的准确性（非常重要），可结合git diff 命令，进一步确定修改内容的准确性

其他命令

```
sapis unreplace
```
执行后会撤销上一步的替换操作，同时也会生成相应的sapisConf.log文件


```
sapis clean
```
执行后会删除相应的的sapisConf.log和sapisConf.js文件