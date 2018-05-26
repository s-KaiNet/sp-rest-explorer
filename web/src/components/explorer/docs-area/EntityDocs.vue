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

import { NavigationProperty } from '../../../../../parser/src/interfaces'
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
  methods: {
    getPropertyName(prop: NavigationProperty): string {
      if (prop.typeName.indexOf('Edm.') !== -1) {
        return prop.typeName.replace(/Edm\./gi, '')
      }

      return prop.typeName
    }
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
.entity-view {
  .attributeName {
    color: #939da3;
    font-size: 16px;
    font-weight: 500;
    line-height: 18px;
    text-transform: uppercase;
    font-family: $textFontFamily;
  }

  .objectGroup {
    color: #333332;
    font-size: 15px;
    font-family: $textFontFamily;
    th {
      padding: 5px 10px;
      border-bottom: 1px solid #ddd;
      vertical-align: bottom;
      font-weight: 600;
      text-align: left;
      line-height: 1.6;
    }
    td {
      padding: 10px;
      text-align: left;
      vertical-align: top;
      line-height: 1.6;
    }
  }
}
</style>
