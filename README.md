# yarn-resolution-plugin

基于 `yarn.lock` 自动收集依赖冲突的 webpack 插件，自动给出 resolutions 建议，以此得到产物减小的收益

_version: 1.0.1_

 - 为什么要使用 yarn resolutions ？

[《 活用 yarn resolutions 统一版本大幅减小产物包体积 》](https://blog.csdn.net/qq_21567385/article/details/112644629)

### 安装

```bash
    yarn add -D yarn-resolution-plugin
```

### 配置

给 webpack 配置本插件，例：

#### webpack.config.js

```js
const YarnResolutionPlugin = require('yarn-resolution-plugin')

module.exports = {
  // ......
  plugins: [new YarnResolutionPlugin()],
}
```

#### vue.config.js

```js
const YarnResolutionPlugin = require('yarn-resolution-plugin')

module.exports = {
  configureWebpack: {
    plugins: [new YarnResolutionPlugin()],
  },
}
```

#### craco.config.js

```js
const YarnResolutionPlugin = require('yarn-resolution-plugin')

module.exports = {
  webpack: {
    configure: (config, { env, paths }) => {
      config.plugins.push(new YarnResolutionPlugin())
      return config
    },
  },
}
```

### 使用

每次 webpack 运行时，本插件将基于 `yarn.lock` 收集目前正在使用的全部依赖信息，你将在本地得到两个文件

#### yarn-conflict.json

当前有冲突的依赖信息列表：

```js
[
  {
    // 当前有冲突的依赖名
    "name": "lodash",

    // 有冲突的版本号
    // 每个元素间代表着冲突，元素本身代表一组归类，意味着本元素列表内的版本没有发生冲突
    "dependenciesVersion": [
      ["4.16"],
      ["4.17.19"],
      ["^4.17.12", "^4.17.15", "^4.17.20", "^4.2.1"]
    ],

    // 最终使用的版本号
    // 意味着产物将包含的重复依赖版本有哪些
    "currentVersion": ["4.16.6", "4.17.19", "4.17.20"]
  }
  // ...
]
```

通常来说我们重点关注某依赖被打入了几份，他们的版本号是什么，也就是 `currentVersion` 字段，这里意味着打包产物中含有三份不同版本的 lodash 。

#### yarn-resolution.json

`package.json` 中 resolutions 字段的建议信息：

```js
// 每个依赖将取最新版本
{
  "resolutions": {
    "lodash": "4.17.20",
    "qs": "6.9.6"
    // ...
  }
}
```

本文件将自动得到有冲突的依赖的 `resolutions` 字段推荐。

你可以经过谨慎评估后，将其复制到 `package.json` 锁定版本号，之后重新安装依赖：

```bash
  # 使用 resolutions 锁定版本后，重新安装依赖
  yarn
```

### 选项

|       name       |         default          | required | description                                                                                                                                                               |
| :--------------: | :----------------------: | :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|      `mode`      |         `major`          |    no    | 过滤有冲突的依赖的版本规则，默认为大版本过滤，即只报告无大版本差异且发生冲突的依赖信息，这将避免一些 BREAKING CHANGE ，可置为 `minor` 过滤次版本，置为 `false` 代表不过滤 |
|  `yarnLockPath`  |      `./yarn.lock`       |    no    | `yarn.lock` 文件位置                                                                                                                                                      |
|     `report`     |          `true`          |    no    | 是否生成 `yarn-conflict.json` 冲突信息                                                                                                                                    |
|   `reportPath`   |  `./yarn-conflict.json`  |    no    | `yarn-conflict.json` 的生成位置                                                                                                                                           |
|   `resolution`   |          `true`          |    no    | 是否生成 `yarn-resolution.json` resolutions 建议                                                                                                                          |
| `resolutionPath` | `./yarn-resolution.json` |    no    | `yarn-resolution.json` 生成位置                                                                                                                                       |

例：

```js
// webpack.config.js
const YarnResolutionPlugin = require('yarn-resolution-plugin')

module.exports = {
  // ......
  plugins: [new YarnResolutionPlugin({
    report: false // 不生成 yarn-conflict.json 冲突信息
  })],
}
```

### 特别注意

1. 你应该谨慎评估使用 resolutions 锁定的依赖，而不是将 `yarn-resolution.json` 无脑的复制使用，通常我们只需针对易发生冲突的常见大型依赖（ 如 lodash 等 ）进行锁定版本，他们在不同版本间不会发生 BREAKING CHANGE ，你可以通过可视化分析插件 [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) 分析产物中各个依赖大小。

2. 每次使用 resolutions 字段锁定依赖后 `yarn` 重新安装依赖才会使得锁定版本生效。