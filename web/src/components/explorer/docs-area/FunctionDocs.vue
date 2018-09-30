<template>
  <div class="function-view" v-if="!!func">
    <h2>Method: {{func.name}} </h2>
    <h2 v-if="hasParentEntity">Parent:
      <doc-link :full-type-name="entityName" :doc-link-type="1"/>
    </h2>
    <div v-if="func.returnType">
      <h3 class="attributeName">Return type: </h3>
      <doc-link :full-type-name="func.returnType" :doc-link-type="1" />
    </div>
    <props-table title="Parameters" :properties="parameters"></props-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import PropsTable from './PropsTable.vue'
import DocLink from './DocLink.vue'
import { MetadataParser } from '../../../services/metadataParser'
import { Api } from '../../../services/api'
import { FunctionImport } from '../../../../../az-funcs/src/interfaces'

export default Vue.extend({
  components: {
    'props-table': PropsTable,
    'doc-link': DocLink
  },
  computed: {
    func(): FunctionImport {
      if (this.typeName) {
        let parser = new MetadataParser(Api.getMetadata([]))
        let entity = parser.getEntity(this.typeName)
        return parser.getFunction(entity, this.funcName)
      }
      if (this.apiPath) {
        let parser = new MetadataParser(Api.getMetadata([]))
        let object = parser.getObjectByPath(this.apiPath)
        if (parser.isFunctionImport(object)) {
          return object
        }
      }
      return null
    },
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
        return this.func.parameters.slice(1)
      }

      return this.func.parameters
    }
  },
  props: {
    apiPath: String,
    typeName: String,
    funcName: String
  }
})
</script>

<style lang="scss" scoped>
</style>
