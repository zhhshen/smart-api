const path = require('path')
const fs = require('fs')
const readline = require('readline')

const resolve = function () {
  return path.resolve
}

const cwd = function(filePath) {
  return path.resolve(process.cwd(), filePath || ".")
}
const pwd = function(filePath) {
  return path.resolve(path.dirname(__dirname), filePath);
}

const exists = function(filePath) {
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return undefined
}

const pkg = function() {
  return exists(cwd("package.json"))
    ? require(cwd("package.json"))
    : {};
}

const getPath = (pathResolve) => {
  // let basePath = __dirname
  // basePath = basePath.replace(/\\/g, '\/')
  // let pathArr = basePath.split('\/')
  // pathArr = pathArr.splice(0, pathArr.length)
  // basePath = pathArr.join('/') + pathResolve
  // return basePath
  return pathResolve
}
const readDirAsync = function (dir) {
  return new Promise(function (resolve, reject) {
      fs.readdir(dir, function (error, files) {
          if (error) return reject(error)
          resolve(files)
      })
  })
}
const stat = (dir) => {
  return new Promise(function (resolve, reject) {
    fs.stat(dir, function (error, stats) {
        if (error) return reject(error)
        resolve(stats)
    })
  })
}
const readFileAsync = function (src) {
  return new Promise((resolve, reject) => {
      fs.readFile(src, 'utf-8', function (err, data) {
          if (err) return reject(err)
          resolve(data)
      })
  })
}
const existsSync = function (dst) {
  if (!fs.existsSync(dst)) {
      fs.mkdirSync(dst)
  } else {
    return undefined
  }
}
const writeFileAsync = function (src, data) {
  return new Promise((resolve, reject) => {
      fs.writeFile(src, data, 'utf-8', function (err) {
          if (err) return reject(err)
          resolve(src)
      })
  })
}
const appendFileAsync = function (src, data) {
  return new Promise((resolve, reject) => {
      fs.appendFile(src, data, 'utf-8', function (err) {
          if (err) return reject(err)
          resolve(src)
      })
  })
}
const deleteFile = function(dst) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dst)) {
      fs.unlink(dst, (err) => {
        if (err) return reject(err)
        resolve(dst)
      })
    } else {
      resolve()
    }
  })
}
// 递归创建目录
const recursionMkdirSync = (dst) => {
  if (fs.existsSync(dst)) {
    return true
  } else {
    if (recursionMkdirSync(path.dirname(dst))) {
      fs.mkdirSync(dst)
      return true
    }
  }
}

const walkFile = async (pathResolve, mime = []) => {
  let fileList = []
  const dirList = await readDirAsync(pathResolve)
  for (let i = 0; i < dirList.length; i++) {
    const filename = dirList[i];
    let filedir = path.join(pathResolve, filename)
    const stats = await stat(filedir)
    let isFile = stats.isFile()
    let isDir = stats.isDirectory()
    if (isFile) {
      let itemArr = filedir.split('\.')
      let itemName = (itemArr.length > 1) ? itemArr[itemArr.length - 2] : 'undefined'
      let itemMime = (itemArr.length > 1) ? itemArr[itemArr.length - 1] : 'undefined'
      if (Array.isArray(mime) && mime.includes(itemMime)) {
        let obj = {
          path: filedir,
          name: itemName,
        }
        fileList.push(obj)
      }
    }
    if (isDir) {
      fileList = fileList.concat(await walkFile(filedir, mime))
    }
  }
  return fileList
}

const readlineFile = (filename, patterns = []) => {
  return new Promise(function (resolve, reject) {
    let rl = readline.createInterface({
      input: fs.createReadStream(filename),
      crlfDelay: Infinity
    })
    let ellipsis = '......'
    let data = ''
    let hanghao = 0
    rl.on('line', line => {
      hanghao++
      patterns.map(v => {
        if (line.match(v)) {
          data += '行号: ' + hanghao + '     ' + line + '\n'
        } 
      })
    }).on('close', () => {
      data += ellipsis
      resolve(data)
    })
  })
}

module.exports = {
  pwd,
  pkg,
  cwd,
  exists,
  getPath,
  readDirAsync,
  stat,
  readFileAsync,
  existsSync,
  deleteFile,
  writeFileAsync,
  appendFileAsync,
  walkFile,
  readlineFile,
  recursionMkdirSync,
}