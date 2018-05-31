<template>
  <div class="entity-view" v-if="!!entity">
    <h2>Entity: {{entity.name}} </h2>
    <h2>Full name:
      <doc-link :full-type-name="entity.fullName" :is-function="false" />
    </h2>
    <props-table title="Properties" :properties="entity.properties"></props-table>
    <props-table title="Navigation properties" :properties="entity.navigationProperties"></props-table>
    <funcs-table title="Methods" :entity="entity"></funcs-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router'

import { MetadataParser } from '../../../services/metadataParser'
import { Api } from '../../../services/api'

import PropsTable from './PropsTable.vue'
import FuncsTable from './FuncsTable.vue'
import DocLink from './DocLink.vue'
import { Entity } from '../../../models/Entity'

interface Data {
  entity: Entity
}

export default Vue.extend({
  components: {
    'props-table': PropsTable,
    'funcs-table': FuncsTable,
    'doc-link': DocLink
  },
  data(): Data {
    return {
      entity: null
    }
  },
  methods: {
    getEntity(route: Route): Entity {
      if (route.params.typeName) {
        let parser = new MetadataParser(Api.getMetadata([]))
        return parser.getEntity(route.params.typeName)
      }

      let parser = new MetadataParser(Api.getMetadata([]))
      let object = parser.getObjectByPath(route.path)
      if (!parser.isFunctionImport(object)) {
        return object
      }

      return null
    }
  },
  mounted() {
    this.entity = this.getEntity(this.$route)
  },
  watch: {
    $route(to: Route) {
      this.entity = this.getEntity(to)
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
