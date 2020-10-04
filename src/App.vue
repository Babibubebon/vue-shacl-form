<template>
  <div id="app">

    <div class="container">
      <h1>vue-shacl-form</h1>
      <form>
        <div class="form-group">
          <label>Shapes Graph</label>
          <div class="input-group">
            <input v-model="shapeFileUri" class="form-control"/>
            <div class="input-group-append">
              <button class="btn btn-primary" v-on:click.prevent="load">Load</button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Target</label>
          <select v-model="targetClass" class="form-control">
            <option v-for="uri in targetShapes" :value="uri">{{ uri }}</option>
          </select>
        </div>
      </form>

      <hr>

      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" id="home-tab" data-toggle="tab" href="#form" role="tab"
             aria-controls="home" aria-selected="true">Form</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="profile-tab" data-toggle="tab" href="#shapes" role="tab"
             aria-controls="profile" aria-selected="false">Shapes</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="contact-tab" data-toggle="tab" href="#data" role="tab"
             aria-controls="contact" aria-selected="false">Data</a>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">

        <div class="tab-pane show active" id="form" role="tabpanel" aria-labelledby="form-tab">
          <shacl-form :shapesGraphText="shapesText"
                      :targetClass="targetClass"
                      :options="options"
                      ref="shaclForm"
                      @update="onUpdate"
                      @load="onLoad"></shacl-form>
          <button @click.prevent="validate" class="btn btn-warning">
            Validate
          </button>
        </div>

        <div class="tab-pane" id="shapes" role="tabpanel" aria-labelledby="shapes-tab">
          <div class="card text-left">
            <div class="card-body">
              <pre v-text="shapesText"></pre>
            </div>
          </div>
        </div>

        <div class="tab-pane" id="data" role="tabpanel" aria-labelledby="data-tab">
          <div class="card text-left">
            <div class="card-body">
              <pre v-text="dataText"></pre>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios'
import * as $rdf from 'rdflib'
import ShaclForm from './ShaclForm';

export default {
  data() {
    return {
      shapeFileUri: document.location.origin + '/shapes.ttl',
      targetClass: '',
      shapesText: '',
      dataText: '',
      shapesGraph: $rdf.graph(),
      targetShapes: [],
      options: {}
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    load() {
      this.shapesGraph = $rdf.graph();
      axios.get(this.shapeFileUri).then(response => {
        this.shapesText = response.data
      }).catch(e => {
        alert('failed to load ' + this.shapeFileUri + '\n' + e)
      })
    },
    validate() {
      console.log(this.$refs)
      this.$refs.shaclForm.validate()
    },
    onUpdate(graph) {
      const serializer = $rdf.Serializer(graph)
      this.dataText = serializer.statementsToN3(graph.statements)

    },
    onLoad(shapes) {
      this.targetShapes = shapes
    }
  },
  components: {ShaclForm}
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
</style>
