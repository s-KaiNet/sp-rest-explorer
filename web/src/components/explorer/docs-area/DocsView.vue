<template>
  <div class="docs-view">
    <h2 v-if="$route.path === '/' || $route.path === '/entity'">Use left side pane for navigation</h2>

    <router-view name="entity-docs" />
    <router-view name="function-docs" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { navigationTypes } from '../../../store/modules/navigation'
import { MetadataParser } from '../../../services/metadataParser'
import { Api } from '../../../services/api'

export default Vue.extend({
  props: {
    apiPath: String
  },
  methods: {
    bindDocs(): void {
      if (this.apiPath) {
        let parser = new MetadataParser(Api.getMetadata([]))
        this.$store.commit(navigationTypes.SET_BREADCRUMB, {
          breadcrumb: parser.buildUriTemplate(this.apiPath)
        })
      }
    }
  },
  mounted() {
    this.bindDocs()
  },
  watch: {
    apiPath(): void {
      this.bindDocs()
    }
  }
})
</script>

<style lang="scss" scoped>
.docs-view {
  margin: 15px;
}
</style>
