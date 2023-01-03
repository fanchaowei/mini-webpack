import fs from 'fs'
import ejs from 'ejs'
import path from 'path'
import parser from '@babel/parser' // 用于 ast 的生成
import traverse from '@babel/traverse' // 用于遍历 ast
import { transformFromAst } from 'babel-core'
import { jsonLoader } from './jsonLoader.js'
import { ChangeOutputPath } from './ChangeOutputPath.js'
import { SyncHook } from 'tapable'

let id = 0

// 模拟 webpack.config.js 内的配置
const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json$/,
        use: [jsonLoader]
      }
    ]
  },
  plugins: [new ChangeOutputPath()]
}

const hooks = {
  emitFile: new SyncHook(['context'])
}

// 该函数主要用于：1. 获取文件的内容。 2. 获取依赖关系
function createAsset(filePath) {
  // 获取文件内容，字符串形式
  let source = fs.readFileSync(filePath, {
    encoding: 'utf-8'
  })

  // 读取所有的 loaders
  const loaders = webpackConfig.module.rules
  // 模拟 webpack 自带的一些 api
  const loaderContext = {
    addDeps(dep) {
      console.log('addDeps', dep)
    }
  }

  loaders.forEach(({ test, use }) => {
    if (test.test(filePath)) {
      // 倘若符合 loader 匹配条件，则调用 use 内的函数进行处理

      if (Array.isArray(use)) {
        // 如果是数组，则倒序依次执行每个 loader 函数
        use.reverse().forEach((fn) => {
          source = fn.call(loaderContext, source)
        })
      } else {
        source = use.call(loaderContext, source)
      }
    }
  })

  // 获得文件内容的 ast 树
  const ast = parser.parse(source, {
    sourceType: 'module'
  })

  // 存储 import 引用的文件的名称/路径
  const deps = new Set()
  // 遍历 ast 树，传入回调来处理我们需要处理的 ast 节点
  traverse.default(ast, {
    // 处理 import 引用
    ImportDeclaration({ node }) {
      deps.add(node.source.value)
    }
  })

  // 将文件内容内的 esm 规范代码转化为 cjs 规范代码，如将 import 转化为 require
  const { code } = transformFromAst(ast, null, {
    presets: ['env']
  })

  // 文件实例对象
  return {
    filePath,
    code,
    deps: [...deps],
    id: id++,
    mapping: {}
  }
}
// 创建一个文件调用图
function createGraph() {
  const mainAsset = createAsset('./example/main.js')

  // 存储文件的实例对象，第一个为 mainAsset
  const queue = [mainAsset]

  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      // 通过文件内容 import 的路径，来依次解析涉及的文件
      const child = createAsset(path.resolve('./example', relativePath))
      // 在解析完一个 import 文件后，就将它和它的 id 信息存入 id 地图中
      asset.mapping[relativePath] = child.id
      queue.push(child)
    })
  }

  return queue
}

// 注册 plugins
function initPlugins() {
  const plugins = webpackConfig.plugins
  plugins.forEach((plugin) => {
    plugin.apply(hooks)
  })
}
initPlugins()

const graph = createGraph()

// 生成打包代码
function build(graph) {
  // 读取模版内的内容
  const template = fs.readFileSync('./bundle.ejs', { encoding: 'utf-8' })

  const data = graph.map((asset) => {
    return {
      id: asset.id,
      filePath: asset.filePath,
      code: asset.code,
      mapping: asset.mapping
    }
  })
  // 将 data 传给 ejs 模版，生成最终的代码内容
  const code = ejs.render(template, { data })
  // 导出路径
  let outputPath = './dist/bundle.js'
  // 传给对应 hooks 使用的执行上下文对象
  const context = {
    chgOutputPath(path) {
      outputPath = path
    }
  }
  // 触发对应 hooks
  hooks.emitFile.call(context)
  // 写入文件
  fs.writeFileSync(outputPath, code)
}

build(graph)
