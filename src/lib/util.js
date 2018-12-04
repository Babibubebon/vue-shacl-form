import $rdf from 'rdflib'

function shrinkUri(node, namespaces) {
  let uri
  if (node instanceof $rdf.NamedNode)
    uri = node.value
  else if (typeof node === 'string')
    uri = node
  else
    return null

  for (let prefix in namespaces) {
    const prefixUrl = namespaces[prefix]
    if (uri.startsWith(prefixUrl))
      return prefix + ':' + uri.substr(prefixUrl.length)
  }

  return uri
}

export {shrinkUri}