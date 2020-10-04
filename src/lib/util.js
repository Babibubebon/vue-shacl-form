import * as $rdf from 'rdflib'

function shrinkUri(node, namespaces) {
  let uri
  if (node.termType && node.termType === 'NamedNode')
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

// From shacl-js/src/rdflib-graph.js
// Monkey Patching rdflib, Literals, BlankNodes and NamedNodes
var exLiteral = $rdf.literal("a", "de");
Object.defineProperty(Object.getPrototypeOf(exLiteral), "lex", { get: function () { return this.value } });
Object.getPrototypeOf(exLiteral).isBlankNode = function () { return false };
Object.getPrototypeOf(exLiteral).isLiteral = function () { return true };
Object.getPrototypeOf(exLiteral).isURI = function () { return false };

var exBlankNode = $rdf.blankNode();
Object.getPrototypeOf(exBlankNode).isBlankNode = function () { return true };
Object.getPrototypeOf(exBlankNode).isLiteral = function () { return false };
Object.getPrototypeOf(exBlankNode).isURI = function () { return false };

var exNamedNode = $rdf.namedNode("urn:x-dummy");
Object.getPrototypeOf(exNamedNode).isBlankNode = function () { return false };
Object.getPrototypeOf(exNamedNode).isLiteral = function () { return false };
Object.getPrototypeOf(exNamedNode).isURI = function () { return true };

export {shrinkUri}
