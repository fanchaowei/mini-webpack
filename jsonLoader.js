export function jsonLoader(source) {
  this.addDeps(source) // 调用 webpack 的 api

  return `export default ${JSON.stringify(source)}`
}
