<template>
  <div v-if="properties && properties.length > 0" class="props-table">
      <h5 class="attributeName">
        <i class="el-icon-minus"></i> {{title}}</h5>
      <table class="objectGroup">
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Required</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop in properties" :key="prop.name">
            <td>{{prop.name}}</td>
            <td>{{getPropertyName(prop.typeName)}}</td>
            <td>{{prop.nullable ? 'true' : 'false'}}</td>
          </tr>
        </tbody>
      </table>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { docsMixin } from '../../../mixins'

export default Vue.extend({
  mixins: [docsMixin],
  props: {
    properties: Array,
    title: String
  }
})
</script>

<style lang="scss" scoped>

</style>
