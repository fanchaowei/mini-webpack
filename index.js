import fs from 'fs'
import path from 'path'
import parser from '@babel/parser' // 用于 ast 的生成
import traverse from '@babel/traverse' // 用于遍历 ast

// 该函数主要用于：1. 获取文件的内容。 2. 获取依赖关系
function createAsset(filePath) {
  // 获取文件内容，字符串形式
  const source = fs.readFileSync(filePath, {
    encoding: 'utf-8'
  })
  // 获得文件内容的 ast 树
  const ast = parser.parse(source, {
    sourceType: 'module'
  })

  const deps = new Set()
  // 遍历 ast 树，传入回调来处理我们需要处理的 ast 节点
  traverse.default(ast, {
    // 处理 import 引用
    ImportDeclaration({ node }) {
      deps.add(node.source.value)
    }
  })

  // 文件实例对象
  return {
    filePath,
    source,
    deps: [...deps]
  }
}
// 创建一个文件调用图
function createGraph() {
  const mainAsset = createAsset('./example/main.js')

  // 存储文件的实例对象，第一个为 mainAsset
  const queue = [mainAsset]

  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const child = createAsset(path.resolve('./example', relativePath))
      queue.push(child)
    })
  }

  return queue
}

console.log(createGraph())
