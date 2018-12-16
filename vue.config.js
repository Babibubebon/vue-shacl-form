const externals = process.env.BUNDLE_DEPS
  ? {}
  : {
    'rdflib': 'rdflib',
    'shacl': 'shacl'
  }

module.exports = {
  css: {
    extract: false
  },
  configureWebpack: {
    externals: {
      'solid-auth-client': 'null',
      'xmldom': 'window',
      'xmlhttprequest': 'XMLHttpRequest',
      ...externals
    }
  }
}
