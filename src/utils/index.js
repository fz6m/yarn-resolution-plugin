const fs = require('fs-extra')
const { uniq } = require('lodash')
const chalk = require('chalk')
const prettier = require('prettier')

const log = console.log

function isExists(path) {
  return fs.existsSync(path)
}

function readFile(path) {
  return fs.readFileSync(path, 'utf-8')
}

function writeFile(path, content, prefix = '') {
  if (typeof content !== 'string') {
    content = prettier.format(JSON.stringify(content), {
      semi: false,
      singleQuote: true,
      printWidth: 80,
      trailingComma: 'es5',
      parser: 'json',
    })
    content = `${prefix}${content}`
  }
  fs.writeFileSync(path, content)
}

function contain(str, findStr) {
  const containTarget = (origin, target) => {
    return !!~origin.indexOf(target)
  }

  if (Array.isArray(findStr)) {
    return findStr.map((i) => containTarget(str, i)).every((i) => i)
  }

  return containTarget(str, findStr)
}

/**
 * 比较数组内元素是否存在差别
 * @param {Array} list
 */
function hasDiff(list) {
  const len = uniq(list).length
  return len !== 1
}

const print = {
  warn: (content) => {
    log(chalk.bold.yellow(content))
  },
  success: (content) => {
    log(chalk.bold.green(content))
  },
}

module.exports = {
  isExists,
  log,
  readFile,
  writeFile,
  contain,
  hasDiff,
  print,
}
