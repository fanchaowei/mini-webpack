/**
 * 由于 import 无法在函数中使用，我们可以自己实现一个 commonJs 的规则的导入以及导出
 */
function require(filePath) {
  // 文件对应的函数
  const map = {
    './main.js': mainjs,
    './foo.js': foojs
  }
  // 获取函数
  const fn = map[filePath]

  const module = {
    exports: {}
  }
  // 执行函数
  fn(require, module)
  // 返回导出的方法
  return module.exports
}

require('./main.js')
// main.js
function mainjs(require, module) {
  const { foo } = require('./foo.js')

  foo()
  console.log('main')
}
// foo.js
function foojs(require, module) {
  function foo() {
    console.log('foo')
  }

  module.exports = {
    foo
  }
}
