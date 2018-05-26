<template>
  <div class="entity-view" v-if="!!entity">
    <h2>Entity: {{entity.name}} </h2>
    <h2>Full name: {{entity.fullName}}</h2>
    <props-table title="Properties" :properties="entity.properties"></props-table>
    <props-table title="Navigation properties" :properties="entity.navigationProperties"></props-table>
    <funcs-table title="Methods" :funcs="entity.functions"></funcs-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import PropsTable from './PropsTable.vue'
import FuncsTable from './FuncsTable.vue'

export default Vue.extend({
  components: {
    'props-table': PropsTable,
    'funcs-table': FuncsTable
  },
  props: {
    entity: Object
  },
  watch: {
    entity(to, from) {
      console.log(to)
      console.log(from)
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
