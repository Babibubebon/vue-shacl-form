<template>
    <div :class="options.styles.field">
        <label :class="options.styles.label">
            <abbr :title="propertyShape.path.value">
                {{ shrink(propertyShape.path) }}
            </abbr>
            <br>
            <button type="button"
                    :class="[options.styles.button, options.styles.buttonAdd]"
                    v-if="!constraintParams.maxCount || constraintParams.maxCount > 1"
                    @click.prevent="add">+
            </button>
        </label>
        <div v-if="!isBlankNode" :class="options.styles.inputColumn">
            <div :class="options.styles.inputGroup" v-for="(value, index) in inputValue">
                <typed-input :datatype="constraintParams.datatype"
                             v-model="inputValue[index]"
                             @input="onInput"/>
                <div v-if="constraintParams.languageIn" :class="options.styles.inputGroupAppend">
                    <select :class="options.styles.input"
                            v-model="language[index]"
                            @change="onInput">
                        <option v-for="lang in constraintParams.languageIn.elements"
                                :value="lang.value">{{ lang.value }}
                        </option>
                    </select>
                </div>
                <button :class="[options.styles.button, options.styles.buttonDel]"
                        v-if="!constraintParams.minCount || constraintParams.minCount > 1"
                        @click.prevent="remove">×
                </button>
            </div>
        </div>
        <div v-else :class="options.styles.inputColumn">
            <form-group :class="options.styles.fieldChild"
                        v-for="(node, index) in objects()" :key="node.value"
                        v-model="quadsUnderBlankNode[index]"
                        :subject="node"
                        :shape="blankNodeTarget"
                        @input="onInput"></form-group>
            <button :class="[options.styles.button, options.styles.buttonDel]"
                    v-if="!constraintParams.minCount || constraintParams.minCount > 1"
                    @click.prevent="remove">×
            </button>
        </div>
    </div>
</template>

<script>
  import $rdf from 'rdflib'
  import TypedInput from './TypedInput.vue'
  import FormGroup from './FormGroup.vue'

  import {shrinkUri} from '../lib/util'

  const SHACL = new $rdf.Namespace('http://www.w3.org/ns/shacl#')

  export default {
    name: 'FormInput',
    props: [
      'propertyShapeNode', // sh:PropertyShape node
      'subject',           // The namedNode of subject of instance
      'value'
    ],
    data() {
      return {
        inputValue: [null],
        language: [null],
        blankNode: [null],
        quadsUnderBlankNode: [],
        constraintParams: {}
      }
    },
    inject: [
      'shapesGraph', 'options'
    ],
    watch: {
      subject() {
        this.onInput()
      },
      constraints: {
        immediate: true,
        handler(newValue) {
          this.constraintParams = {}
          newValue.forEach(constraint => {
            for (let param in constraint.parameterValues) {
              let value = constraint.parameterValues[param]
              if (param === 'property') {
                if (!this.constraintParams[param]) this.$set(this.constraintParams, param, [])
                this.constraintParams[param].push(value)
              } else {
                this.$set(this.constraintParams, param, value)
              }
            }
          })
        }
      }
    },
    computed: {
      propertyShape() {
        return this.shapesGraph.getShape(this.propertyShapeNode)
      },
      constraints() {
        return this.propertyShape.getConstraints()
      },
      isBlankNode() {
        return this.constraintParams['nodeKind'] && this.constraintParams['nodeKind'].equals(SHACL('BlankNode'))
      },
      blankNodeTarget() {
        // from class of sh:class
        if (this.constraintParams['class'])
          return this.shapesGraph.getShape(this.constraintParams['class'])
        // from sh:property
        return this.propertyShape
      },
      quads() {
        const objects = this.objects()
        if (objects.length === 0)
          return null

        let quads = objects
          .filter(v => v)
          .map(object => $rdf.quad(this.subject, this.propertyShape.path, object))

        if (this.isBlankNode) {
          if (!this.quadsUnderBlankNode || this.quadsUnderBlankNode.flat().length === 0)
            return null
          quads = quads.concat(this.quadsUnderBlankNode.flat())
        }
        return quads
      },
    },
    methods: {
      add() {
        if (this.isBlankNode) {
          this.blankNode.push(null)
        } else {
          this.inputValue.push(null)
          this.language.push(null)
        }
      },
      remove(index) {
        if (this.isBlankNode) {
          this.blankNode.splice(index, 1)
          this.quadsUnderBlankNode.splice(index, 1)
          if (this.blankNode.length === 0)
            this.add()
        } else {
          this.inputValue.splice(index, 1)
          this.language.splice(index, 1)
          if (this.inputValue.length === 0)
            this.add()
        }
        this.onInput()
      },
      objects() {
        const objects = []

        if (this.isBlankNode) {
          this.blankNode.forEach((value, index) => {
            if (!this.blankNode[index])
              this.$set(this.blankNode, index, $rdf.blankNode())
            objects.push(this.blankNode[index])
          })
        } else {
          this.inputValue.forEach((value, index) => {
            if (this.constraintParams['nodeKind'] && this.constraintParams['nodeKind'].equals(SHACL('IRI')))
              objects.push(value ? $rdf.namedNode(value) : null)
            else {
              let language = this.constraintParams['languageIn'] && this.constraintParams['languageIn'].length === 1
                ? this.languageIn[0]   // default language tag
                : this.language[index]
              this.$set(this.language, index, language)
              objects.push(value ? $rdf.literal(value, this.language[index] || this.constraintParams['datatype']) : null)
            }
          })
        }
        return objects
      },
      onInput() {
        this.$emit('input', this.quads)
      },
      shrink(node) {
        if (!node) return ''
        return shrinkUri(node, this.shapesGraph.context.$shapes.store.namespaces)
      },
    },
    components: {
      'TypedInput': TypedInput,
      'FormGroup': FormGroup
    }
  }
</script>

<style scoped>
    .btn-add-del {
        font-weight: bold;
        font-size: 18px;
        padding: 0.25rem;
        line-height: 1;
    }
</style>
