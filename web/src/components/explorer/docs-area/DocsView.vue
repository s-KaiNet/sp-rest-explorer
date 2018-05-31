<template>
  <div class="docs-view">
    <h2 v-if="$route.path === '/'">Use left side pane for navigation</h2>

    <router-view name="entity-docs" />
    <router-view name="function-docs" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router'

import { consts } from '../../../services/consts'
import { navigationTypes } from '../../../store/modules/navigation'
import { MetadataParser } from '../../../services/metadataParser'
import { Api } from '../../../services/api'

export default Vue.extend({
  methods: {
    bindDocs(route: Route): void {
      let path = route.path
      if (path.indexOf(consts.apiPrefix) !== -1) {
        let parser = new MetadataParser(Api.getMetadata([]))
        this.$store.commit(navigationTypes.SET_BREADCRUMB, {
          breadcrumb: parser.buildUriTemplate(path)
        })
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
