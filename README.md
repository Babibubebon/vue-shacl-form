# vue-shacl-form
A Vue.js component for HTML5 form generation based on [SHACL](https://www.w3.org/TR/shacl/)

## Installation
```
npm i -S vue-shacl-form
```

## Usage
[**Demo**](https://jsfiddle.net/Babibubebon/e83a0yhL/4/)

basic example
```html
<template>
  <div id="app">
    <h1>vue-shacl-form</h1>
    <shacl-form :shapesGraphText="shapes" targetClass="http://example.com/Book" @update="onUpdate"></shacl-form>
    <pre v-text="data"></pre>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import VueShaclForm from "vue-shacl-form";

const shapes = `
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sh:   <http://www.w3.org/ns/shacl#> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .
@prefix ex: <http://example.com/> .

ex:BookShape
    a sh:NodeShape ;
    sh:targetClass ex:Book ;
    sh:property [
        sh:path ex:title ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path ex:author ;
    ] ;
    sh:property [
        sh:path ex:datePublished ;
        sh:datatype xsd:date ;
    ] ;
    sh:property [
        sh:path ex:isbn ;
        sh:pattern "^(97(8|9))?\\\\d{9}(\\\\d|X)$" ;
        sh:maxCount 1 ;
    ] ;
    .
`;

export default {
  name: "app",
  data() {
    return {
      shapes: shapes,
      data: ""
    };
  },
  methods: {
    onUpdate(dataGraph) {
      if (dataGraph) {
        this.data = dataGraph.toNT();
      }
    }
  },
  components: {
    "shacl-form": VueShaclForm
  }
};
</script>
```

## Development
start dev server
```
npm run serve
```

build bundle files
```
npm run build
```
