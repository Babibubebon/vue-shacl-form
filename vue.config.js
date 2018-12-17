const externals = process.env.BUNDLE_DEPS
  ? {}
  : {
    'rdflib': {
      commonjs: 'rdflib',
      commonjs2: 'rdflib',
      root: '$rdf',
    },
    'shacl': {
      commonjs: 'shacl',
      commonjs2: 'shacl',
      root: 'SHACLValidator'
    }
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
