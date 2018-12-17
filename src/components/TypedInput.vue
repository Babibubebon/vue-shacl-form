<template>
    <div v-if="inputType === 'radio'">
        <div :class="options.styles.radioGroup">
            <input type="radio" value="true"
                   :class="options.styles.radio"
                   :name="id + '_radio'" :id="id + '_true'"
                   :checked="value === 'true'" @input="onInput">
            <label :class="options.styles.radioLabel" :for="id + '_true'">true</label>
        </div>
        <div :class="options.styles.radioGroup">
            <input type="radio" value="false"
                   :class="options.styles.radio"
                   :name="id + '_radio'" :id="id + '_false'"
                   :checked="value === 'false'" @input="onInput">
            <label :class="options.styles.radioLabel" :for="id + '_false'">false</label>
        </div>
    </div>
    <input v-else
           :class="[options.styles.input, isValid ? options.styles.validInput : options.styles.invalidInput]"
           :type="inputType"
           :minlength="minlength" :maxlength="maxlength"
           :value="value" @input="onInput"/>
</template>

<script>
  import $rdf from 'rdflib'

  const XSD = new $rdf.Namespace('http://www.w3.org/2001/XMLSchema#')

  export default {
    name: 'TypedInput',
    props: [
      'constraints', 'value', 'isValid'
    ],
    data() {
      return {
        'id': null
      }
    },
    inject: [
      'options'
    ],
    mounted() {
      this.id = this._uid;
    },
    computed: {
      inputType() {
        switch (!this.constraints.datatype || this.constraints.datatype.value) {
          case XSD('date').value:
            return 'date'
          case XSD('time').value:
            return 'time'
          case XSD('dateTime').value:
          case XSD('dateTimeStamp').value:
            return 'datetime-local'
          case XSD('integer').value:
          case XSD('decimal').value:
            return 'number'
          case XSD('boolean').value:
            return 'radio'
          default:
            return 'text'
        }
      },
      minlength() {
        return this.constraints.minLength ? this.constraints.minLength : null
      },
      maxlength() {
        return this.constraints.maxLength ? this.constraints.maxLength : null
      },
    },
    methods: {
      onInput(event) {
        this.$emit('input', event.target.value)
      }
    }
  }
</script>

<style scoped>

</style>
