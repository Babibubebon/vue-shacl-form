<template>
    <div :class="options.styles.field">
        <div :class="options.styles.label">
            <abbr :title="propertyShape.path.value">
                {{ shrink(propertyShape.path) }}
            </abbr>
            <br>
            <button type="button"
                    :class="[options.styles.button, options.styles.buttonAdd]"
                    v-if="isAddable"
                    @click.prevent="add">+
            </button>
        </div>
        <div v-if="!isBlankNode" :class="options.styles.inputColumn">
            <div v-for="(value, index) in inputValue" :class="options.styles.inputGroup">
                <typed-input :datatype="constraintParams.datatype"
                             :isValid="isValid(index)"
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
                        v-if="isRemovable"
                        @click.prevent="remove(index)">×
                </button>
                <div :class="options.styles.invalidFeedback" v-if="!isValid(index)">
                    <ul>
                        <li v-for="result in validation[index]">{{ result.message() }}</li>
                    </ul>
                </div>
            </div>
        </div>
        <div v-else :class="options.styles.inputColumn">
            <div v-for="(node, index) in objects()" :key="node.value">
                <form-group :class="options.styles.fieldChild"
                            v-model="quadsUnderBlankNode[index]"
                            :subject="node"
                            :shape="blankNodeTarget"
                            @input="onInput"></form-group>
                <button :class="[options.styles.button, options.styles.buttonDel]"
                        v-if="isRemovable"
                        @click.prevent="remove(index)">×
                </button>
            </div>
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
      'propertyShapeNode', // Shape instance which is sh:PropertyShape
      'subject',           // subject of the instance being edited
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
      'shapesGraph', 'options', 'validationResults'
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
      isAddable() {
        return !this.constraintParams.maxCount
          || this.constraintParams.maxCount > this.inputValue.length
      },
      isRemovable() {
        return !this.constraintParams.minCount
          || this.constraintParams.minCount < this.inputValue.length
      },
      validation() {
        if (this.validationResults.length === 0)
          return []

        const focusNode = this.subject.termType === 'BlankNode' ? this.subject.toString() : this.subject.value
        return this.inputValue.map(value => {
          return this.validationResults.filter(result => {
            return result.focusNode() === focusNode
              && result.path() === this.propertyShape.path.value
              && (!result.resultNode['http://www.w3.org/ns/shacl#value']
                || result.resultNode['http://www.w3.org/ns/shacl#value'][0]['@value'] === value)
          })
        })
      },
      quads() {
        const objects = this.objects()
        if (objects.length === 0)
          return null

        if (!this.subject)
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
      isValid(index) {
        return !this.validation[index] || this.validation[index].length === 0
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
              let language = this.constraintParams['languageIn'] && this.constraintParams['languageIn'].elements.length === 1
                ? this.constraintParams['languageIn'].elements[0].value   // default language tag
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
