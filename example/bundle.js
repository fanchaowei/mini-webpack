/**
 * 由于 import 无法在函数中使用，我们可以自己实现一个 commonJs 的规则的导入以及导出
 */
;(function (modules) {
  function require(id) {
    // 获取函数
    const [fn, mapping] = modules[id]
    const module = {
      exports: {},
    }

    function localRequire(filePath) {
      // 在路径地图内查找对应路径的 id
      const id = mapping[filePath]
      return require(id)
    }

    // 执行函数
    fn(localRequire, module, module.exports)
    // 返回导出的方法
    return module.exports
  }

  require(1)
})({
  1: [
    function (require, module, exports) {
      const { foo } = require('./foo.js')

      foo()
      console.log('main')
    },
    {
      './foo.js': 2,
    },
  ],
  2: [
    function (require, module, exports) {
      function foo() {
        console.log('foo')
      }

      module.exports = {
        foo,
      }
    },
    {},
  ],
})
