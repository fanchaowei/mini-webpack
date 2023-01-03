export class ChangeOutputPath {
  apply(hooks) {
    hooks.emitFile.tap('changeOutputPath', (context) => {
      console.log('----------changeOutputPath')
      // 调用执行上下文内的方法
      context.chgOutputPath('./dist/app.js')
    })
  }
}
