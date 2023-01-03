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

require(0)
})({

  "0": [function(require, module, exports) {
    "use strict";

var _foo = require("./foo.js");

var _foo2 = _interopRequireDefault(_foo);

var _user = require("./user.json");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_user2.default);
(0, _foo2.default)();
console.log('main');
      },{"./foo.js":1,"./user.json":2}],
        
  "1": [function(require, module, exports) {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = foo;

function foo() {
  console.log('foo');
}
      },{}],
        
  "2": [function(require, module, exports) {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "{\n  \"name\": \"li\",\n  \"age\": \"18\"\n}";
      },{}],
        
          })