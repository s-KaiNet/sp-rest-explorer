<template>
  <div class="entity-view" v-if="!!entity">
    <h2>Entity: {{entity.name}} </h2>
    <h2>Full name:
      <doc-link :full-type-name="entity.fullName" :doc-link-type="1"/>
    </h2>
    <div v-if="!!entity.baseTypeName">
        <h3> Base Type: <doc-link :full-type-name="entity.baseTypeName" :doc-link-type="1"/> </h3>
    </div>
    <props-table title="Properties" :properties="entity.properties"></props-table>
    <props-table title="Navigation properties" :properties="entity.navigationProperties"></props-table>
    <funcs-table title="Methods" :entity="entity"></funcs-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { MetadataParser } from '../../../services/metadataParser'
import { Api } from '../../../services/api'

import PropsTable from './PropsTable.vue'
import FuncsTable from './FuncsTable.vue'
import DocLink from './DocLink.vue'
import { Entity } from '../../../models/Entity'

export default Vue.extend({
  components: {
    'props-table': PropsTable,
    'funcs-table': FuncsTable,
    'doc-link': DocLink
  },
  props: {
    apiPath: String,
    typeName: String,
    propName: String
  },
  computed: {
    entity(): Entity {
      if (this.typeName && this.propName) {
        let parser = new MetadataParser(Api.getMetadata([]))
        let entity = parser.getEntity(this.typeName)
        return parser.getEntity(parser.getProperty(entity, this.propName).typeName)
      }
      if (this.typeName) {
        let parser = new MetadataParser(Api.getMetadata([]))
        return parser.getEntity(this.typeName)
      }
      if (this.apiPath) {
        let parser = new MetadataParser(Api.getMetadata([]))
        let object = parser.getObjectByPath(this.apiPath)
        if (!parser.isFunctionImport(object)) {
          return object
        }
      }

      return null
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
