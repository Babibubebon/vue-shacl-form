module.exports = {
  css: {
    extract: false
  },
  configureWebpack: {
    externals: {
      'solid-auth-client': 'null',
      'xmldom': 'window',
      'xmlhttprequest': 'XMLHttpRequest'
    }
  }
}
