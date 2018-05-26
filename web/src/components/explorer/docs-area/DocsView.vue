<template>
  <div class="docs-view">
    <h2 v-if="!resolved">Use left side pane for navigation</h2>

    <entity-view :entity="entity"></entity-view>
    <function-view :func="func"></function-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router'

import { consts } from '../../../services/consts'
import { navigationTypes } from '../../../store/modules/navigation'
import { MetadataParser } from '../../../services/metadataParser'
import { ApiService } from '../../../services/api'
import FunctionDocs from './FunctionDocs.vue'
import EntityDocs from './EntityDocs.vue'

interface Data {
  entity: any,
  func: any,
  resolved: boolean
}

export default Vue.extend({
  name: 'docs-view',
  components: {
    'entity-view': EntityDocs,
    'function-view': FunctionDocs
  },
  data(): Data {
    return {
      resolved: false,
      entity: null,
      func: null
    }
  },
  methods: {
    bindDocs(route: Route): void {
      let path = route.path
      if (path.indexOf(consts.apiPrefix) !== -1) {
        this.resolved = true
        ApiService
      .getMetaData()
      .then(metadata => {
        let parser = new MetadataParser(metadata)
        let object = parser.getObjectByPath(path)
        if (parser.isFunctionImport(object)) {
          this.entity = null
          this.func = object
        } else {
          this.entity = object
          this.func = null
        }

        this.$store.commit(navigationTypes.SET_BREADCRUMB, {
          breadcrumb: parser.buildUriTemplate(path)
        })
      })
      .catch(err => {
        throw err
      })
      } else {
        this.func = null
        this.entity = null
        this.resolved = false
      }
    }
  },
  mounted() {
    this.bindDocs(this.$route)
  },
  watch: {
    $route(to: Route) {
      this.bindDocs(to)
    }
  }
})
</script>

<style lang="scss" scoped>
.docs-view {
  margin: 15px;
}
</style>
