<template>
    <div>
        <form-input v-for="(cons, idx) in propertyConstraints"
                    :subject="subject"
                    :propertyShapeNode="cons.paramValue"
                    v-model="quads[idx]"
                    v-on:input="onInput"></form-input>
    </div>
</template>

<script>
  import $rdf from 'rdflib'

  const SHACL = new $rdf.Namespace('http://www.w3.org/ns/shacl#')

  export default {
    name: 'FromGroup',
    props: [
      'shape',
      'subject', // The namedNode of subject of instance
    ],
    data() {
      return {
        quads: [],
      }
    },
    beforeCreate: function () {
      this.$options.components.FormInput = require('./FormInput.vue').default
    },
    computed: {
      propertyConstraints() {
        return this.shape.constraints.filter(cons => {
          return cons.component.node.equals(SHACL('PropertyConstraintComponent'))
        })
      }
    },
    methods: {
      onInput() {
        this.$emit('input', this.quads.flat().filter(elm => elm))
      }
    }
  }
</script>

<style scoped>

</style>
