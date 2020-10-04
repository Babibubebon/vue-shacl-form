<template>
  <form>
    <div :class="mergedOptions.styles.field">
      <label :class="mergedOptions.styles.label">
        Subject URI
      </label>
      <div :class="mergedOptions.styles.inputColumn">
        <input :class="mergedOptions.styles.input" v-model="subjectUri"/>
      </div>
    </div>
    <form-group :subject="subject" :shape="shape" v-if="shape"
                v-model="quads" @input="onUpdate"></form-group>

  </form>
</template>

<script>
import merge from 'merge'
import * as $rdf from 'rdflib'
import SHACLValidator from 'shacl'

import FormGroup from './components/FormGroup.vue'
import defaultOptions from './lib/options'

export default {
  name: 'ShaclForm',
  props: {
    shapesGraph: Object,
    shapesGraphText: String,
    targetClass: String,
    options: Object
  },
  data() {
    return {
      subjectUri: null,
      quads: [],
      mergedOptions: defaultOptions,
      validator: new SHACLValidator(),
      validationResults: []
    }
  },
  provide() {
    return {
      shapesGraph: this.validator.shapesGraph,
      validationResults: this.validationResults,
      options: this.mergedOptions
    }
  },
  watch: {
    shapesGraphText: {
      immediate: true,
      handler(newValue) {
        this.validator.updateShapesGraph(newValue, this.mergedOptions.format, () => {
          this.onLoad()
        })
      }
    },
    shapesGraph: {
      deep: true,
      handler(newValue) {
        this.validator.updateShapesGraphRdfModel(newValue, () => {
          this.onLoad()
        })
      }
    },
    options: {
      deep: true,
      immediate: true,
      handler(newOptions) {
        merge.recursive(defaultOptions, newOptions)
      }
    }
  },
  computed: {
    subject() {
      try {
        return $rdf.namedNode(this.subjectUri)
      } catch (e) {
        return null
      }
    },
    shapeNode() {
      return this.targetClass ? $rdf.namedNode(this.targetClass) : null
    },
    shape() {
      return this.shapeNode ? this.validator.shapesGraph.getShape(this.shapeNode) : null
    },
  },
  methods: {
    onUpdate() {
      const graph = $rdf.graph()
      if (this.subject) {
        graph.namespaces = Object.assign({}, this.validator.$shapes.store.namespaces)
        graph.addAll(this.quads)
      }
      this.$emit('update', graph)
    },
    onLoad() {
      const shapes = this.validator.shapesGraph.getShapesWithTarget().filter(shape => {
        const uri = shape.shapeNode.value
        return !uri.startsWith('http://datashapes.org/dash#') && !uri.startsWith('http://www.w3.org/ns/shacl#')
      }).map(shape => {
        return shape.shapeNode.value
      })
      this.$emit('load', shapes)
    },
    validate() {
      return new Promise((resolve, reject) => {
        const graph = $rdf.graph()
        graph.addAll(this.quads)
        this.validator.updateDataGraphRdfModel(graph, (err, report) => {
          if (err) {
            reject(err)
            console.log(err)
          } else {
            this.validationResults.splice(0, this.validationResults.length)
            this.validationResults.push(...report.results())
            resolve(report.results())
            console.log(report.results())
          }
        })
      })
    }
  },
  components: {
    FormGroup
  }
}
</script>

<style scoped>

</style>
