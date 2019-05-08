const path = require('path')
const fs = require('fs')
const utils = require('./utils')
const cp = require('cp-file').sync
const merge = require('lodash.merge')
const chalk = require('chalk')
const dayjs = require('dayjs')

const {
  getPath,
  readDirAsync,
  stat,
  readFileAsync,
  existsSync,
  writeFileAsync,
  appendFileAsync,
  walkFile,
  deleteFile,
  readlineFile,
  pwd,
  pkg,
  cwd,
  exists
} = utils
const PKG = pkg()
const Log = console.log

let MOCK_EXTENSIONS = []
let MOCK_PATH = ''
let SOURCE_PATH = []
let SOURCE_EXTENSIONS = []
let API_PREFIX = ''
let API_OUTPUT = ''
let API_ALIAS = 'apiConfig'

const defaultOpt = {
  mock: {
    extensions: ['js', 'json'], // mock文件后缀名
    path: ''
  },
  source: {
    extensions: [],
    path: []
  },
  api: {
    prefix: 'api',
    output: '/',
    alias: 'apiConfig'
  }
}

const createOpts = async (opts = {}) => {
  const params = merge({}, defaultOpt, opts)
  console.log(params)
  const {
    mock,
    source,
    api
  } = params
  MOCK_PATH = mock.path
  MOCK_EXTENSIONS = mock.extensions
  SOURCE_PATH = source.path
  SOURCE_EXTENSIONS = source.extensions
  API_PREFIX = api.prefix
  API_OUTPUT = api.output
  API_ALIAS = api.alias
}

// 生成api config文件
const createApiConfig = async () => {
  let text = ''
  let jsonText = {}
  const fileList = await walkFile(getPath(MOCK_PATH), MOCK_EXTENSIONS)
  for (let i = 0; i < fileList.length; i++) {
    const {
      name
    } = fileList[i]
    const urlPath = name.substr(name.indexOf(MOCK_PATH) + MOCK_PATH.length)
    let prefixName = ''
    let paths = urlPath.split('/')
    paths.map((name, index) => {
      if (index > 1) {
        prefixName += name.substring(0, 1).toUpperCase() + name.substring(1)
      }
    })
    let file = `export const ${prefixName} = '${urlPath}'`
    text += '\r' + file
    jsonText[urlPath] = prefixName
  }
  return {
    text,
    jsonText
  }
}

const writeApiConfig = async () => {
  const {
    text
  } = await createApiConfig()
  const dst = getPath(API_OUTPUT)
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst)
  }
  let destPath = dst + '/' + API_ALIAS + '.js'
  try {
    await writeFileAsync(destPath, text)
    Log(chalk.blue('写入api配置文件: success！'))
  } catch (error) {
    Log(error)
  }
}
// 遍历文件，替换APi
const replaceApi = async (bool = true, LogFileName) => {
  for (let i = 0; i < SOURCE_PATH.length; i++) {
    const v = SOURCE_PATH[i]
    const apiFiles = await walkFile(getPath(v), SOURCE_EXTENSIONS)
    let doc = ''
    for (let i = 0; i < apiFiles.length; i++) {
      const item = apiFiles[i]
      const {
        jsonText
      } = await createApiConfig()
      let file = await readFileAsync(item.path)
      let currFile = file
      let oldLineDoc = ''
      let newLineDoc = ''
      for (const x in jsonText) {
        if (jsonText.hasOwnProperty(x)) {
          const element = jsonText[x]
          // 替换文件u
          if (bool) {
            let tag = x.replace(/\'/g, '')
            const types = [
              '`' + tag + '`',
              "'" + tag + "'",
              '"' + tag + '"',
              tag
            ]
            types.forEach(v => {
              if (currFile.match(v)) {
                let patt = new RegExp(v, 'g')
                currFile = currFile.replace(patt, `${API_PREFIX}.${element}`)
                oldLineDoc = v
                newLineDoc = `${API_PREFIX}.${element}`
              }
            })
          } else {
            if (currFile.match(`${API_PREFIX}.${element}`)) {
              let patt = new RegExp(`${API_PREFIX}.${element}`, 'g')
              currFile = currFile.replace(patt, "'" + x + "'")
              oldLineDoc = `${API_PREFIX}.${element}`
              newLineDoc = "'" + x + "'"
            }
          }
        }
      }
      if (currFile !== file) {
        // 生成新的文件
        try {
          await writeFileAsync(item.path, currFile)
          if (bool) {
            Log(chalk.blue(`${item.path} ：`, '替代成功！'))
          } else {
            Log(chalk.blue(`${item.path} ：`, '撤销成功！'))
          }
          if (oldLineDoc && newLineDoc) {
            doc += '\r' + item.path + '\r' + '修改：' + oldLineDoc + '  ------>  ' + newLineDoc + '\r' + '时间：' + dayjs().format('YYYY-MM-DD HH:mm:ss') + '\r' + '----------'
          }
          try {
            // 生成新的修改日志
            await writeFileAsync(`${LogFileName}`, doc)
            Log(chalk.green(`${item.path} ：`, '操作日志更新成功！'))
          } catch (err) {
            Log(err)
          }
        } catch (error) {
          Log(error)
        }
      }
    }
  }
}

// 撤销操作
const unreplaceApi = async (bool, LogFileName) => {
  await replaceApi(bool, LogFileName)
}
let configName = 'sapisConf'
let targetFile = `./${configName}.js`
let LogFileName = `./${configName}.log`
const run = {
  init: async function () {
    await run.clean()
    cp(pwd('template/index.js'), `./${configName}.js`)
    Log(chalk.blue('初始化配置文件：', 'success！'))
  },
  replace: async function () {
    if (exists(targetFile)) {
      const sapiConf = require(cwd(targetFile))
      await createOpts(sapiConf)
      await writeApiConfig()
      await replaceApi(true, LogFileName)
      Log(chalk.blue('替换文件：success！'))
      Log(chalk.green(`操作日志：success！ Please check the ${configName}.log ！`))
    } else {
      Log(chalk.red('配置文件：missing！'))
    }
  },
  unreplace: async function () {
    if (exists(targetFile)) {
      const sapiConf = require(cwd(targetFile))
      await createOpts(sapiConf)
      await unreplaceApi(false, LogFileName)
      Log(chalk.blue('撤销文件替换：success！'))
      Log(chalk.green(`操作日志：success！ Please check the ${configName}.log ！`))
    } else {
      Log(chalk.blue('配置文件：missing！'))
    }
  },
  // 清空
  clean: async function () {
    await run.unreplace()
    const destPath = getPath(API_OUTPUT) + '/' + API_ALIAS + '.js'
    await deleteFile(cwd(destPath)) // 删除apiConfig文件
    await deleteFile(cwd(`./${configName}.js`)) // 删除sapiConf.js文件
    await deleteFile(cwd(`./${configName}.log`)) // 删除sapiConf.log文件
    Log(chalk.red('清空操作：success！'))
  }
}
module.exports = run