const { isExists, readFile, writeFile, print } = require('./utils')
const { parse } = require('./core')
const {
  handleConflict,
  clearDiff,
  generatorResolution,
} = require('./core/handleConflict')

const pluginName = 'YarnResolutionPlugin'

class YarnResolutionPlugin {
  constructor(options) {
    this.options = {
      ...{
        mode: 'major', // 默认过滤 major 差异版本，关闭过滤请传入 mode: false
        yarnLockPath: './yarn.lock',
        report: true, // 是否开启冲突报告
        reportPath: './yarn-conflict.json',
        resolution: true, // 是否开启 resolution 建议
        resolutionPath: './yarn-resolution.json',
      },
      ...options,
    }
  }

  apply(compiler) {
    compiler.hooks.done.tap(pluginName, (compilation) => {
      const path = this.options.yarnLockPath
      if (!isExists(path)) {
        print.warn(`[${pluginName}]: yarn.lock does not exist`)
        return
      }

      // 读取文件
      const content = readFile(path)

      // 收集依赖
      const deps = parse(content)

      // 收集冲突
      let result = handleConflict(deps)

      // 过滤版本
      result = this.options.mode ? clearDiff(result, this.options.mode) : result

      // 提示冲突数量
      print.warn(
        `[${pluginName}]: currently ${result.length} conflicting dependencies`
      )

      // 生成冲突报告
      if (this.options.report) {
        writeFile(this.options.reportPath, result)

        print.success(
          `[${pluginName}]: conflict report has been generated in ${this.options.reportPath}`
        )
      }

      // 生成 resolution 建议
      if (this.options.resolution) {
        result = generatorResolution(result)
        writeFile(
          this.options.resolutionPath,
          { resolutions: result },
          '// ❗︎ 以下仅代表自动收集结果，请谨慎对待使用 resolution 的依赖\n// 📚 https://github.com/fz6m/yarn-resolution-plugin#特别注意\n'
        )

        print.success(
          `[${pluginName}]: generated resolution recommended in ${this.options.resolutionPath}`
        )
      }
    })
  }
}

module.exports = YarnResolutionPlugin
