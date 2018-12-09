<template>
    <form>
        <div :class="mergedOptions.styles.field">
            <label :class="mergedOptions.styles.label">
                Subject
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
  import $rdf from 'rdflib'
  import SHACLValidator from 'shacl'
  import merge from 'merge'

  import FormGroup from './components/FormGroup.vue'
  import defaultOptions from './lib/options'

  export default {
    name: 'ShaclForm',
    props: [
      'shapesGraph',
      'shapesGraphText',
      'targetClass',
      'options'
    ],
    data() {
      return {
        subjectUri: '',
        quads: [],
        mergedOptions: defaultOptions,
        validator: new SHACLValidator()
      }
    },
    provide() {
      return {
        shapesGraph: this.validator.shapesGraph,
        options: this.mergedOptions
      }
    },
    watch: {
      shapesGraphText: {
        handler(newValue) {
          this.validator.updateShapesGraph(newValue, () => true)
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
        if (!this.subject) return
        const graph = $rdf.graph()
        graph.namespaces = Object.assign({}, this.validator.$shapes.store.namespaces)
        graph.addAll(this.quads)
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
      }
    },
    components: {
      'FormGroup': FormGroup
    }
  }
</script>

<style scoped>

</style>
