<template>
  <div v-if="properties && properties.length > 0" class="props-table">
    <h5 class="attributeName">{{title}}</h5>
    <table class="objectGroup">
      <thead>
        <tr>
          <th>Property</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prop in properties" :key="prop.name">
          <td class="name">{{prop.name}}</td>
          <td>
            <doc-link :full-type-name="prop.typeName" :doc-link-type="1" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import DocLink from './DocLink.vue'

export default Vue.extend({
  components: {
    'doc-link': DocLink
  },
  props: {
    properties: Array,
    title: String
  }
})
</script>

<style lang="scss" scoped>

</style>
