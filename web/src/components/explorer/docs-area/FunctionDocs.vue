<template>
  <div class="function-view" v-if="!!func">
    <h2 v-if="hasParentEntity">Parent: {{entityName}} </h2>
    <h2>Method: {{func.name}} </h2>
    <div v-if="func.returnType">
      <h3 class="attributeName">Return type: </h3>
      <doc-link :full-type-name="func.returnType" :is-function="false" />
    </div>
    <props-table title="Parameters" :properties="parameters"></props-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router'

import PropsTable from './PropsTable.vue'
import DocLink from './DocLink.vue'
import { MetadataParser } from '../../../services/metadataParser'
import { Api } from '../../../services/api'
import { FunctionImport } from '../../../../../parser/src/interfaces'

interface Data {
  func: FunctionImport
}

export default Vue.extend({
  components: {
    'props-table': PropsTable,
    'doc-link': DocLink
  },
  computed: {
    entityName(): string {
      if (this.func.parameters[0].name === 'this') {
        return this.func.parameters[0].typeName
      }
    },
    hasParentEntity(): boolean {
      if (
        !this.func ||
        !this.func.parameters ||
        this.func.parameters.length === 0
      ) {
        return false
      }

      if (this.func.parameters[0].name === 'this') {
        return true
      }

      return false
    },
    parameters(): any[] {
      if (
        !this.func ||
        !this.func.parameters ||
        this.func.parameters.length === 0
      ) {
        return []
      }

      if (this.func.parameters[0].name === 'this') {
        return this.func.parameters.splice(1)
      }

      return this.func.parameters
    }
  },
  data(): Data {
    return {
      func: null
    }
  },
  methods: {
    getFunc(route: Route): FunctionImport {
      if (route.params.typeName) {
        let parser = new MetadataParser(Api.getMetadata([]))
        let entity = parser.getEntity(route.params.typeName)
        return parser.getFunction(entity, route.params.funcName)
      }

      let parser = new MetadataParser(Api.getMetadata([]))
      let object = parser.getObjectByPath(route.path)
      if (parser.isFunctionImport(object)) {
        return object
      }
      return null
    }
  },
  mounted() {
    this.func = this.getFunc(this.$route)
  },
  watch: {
    $route(to: Route) {
      this.func = this.getFunc(to)
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
