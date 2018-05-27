<template>
  <div class="function-view" v-if="!!func">
    <h2 v-if="hasParentEntity">Entity: {{entityName}} </h2>
    <h2>Method: {{func.name}} </h2>
    <div v-if="func.returnType">
      <h3 class="attributeName">Return type: </h3>
      <span>{{func.returnType}}</span>
    </div>
    <props-table title="Parameters" :properties="parameters"></props-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import PropsTable from './PropsTable.vue'

export default Vue.extend({
  components: {
    'props-table': PropsTable
  },
  computed: {
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
        return this.func.parameters.splice(1)
      }

      return this.func.parameters
    }
  },
  props: {
    func: Object
  }
})
</script>

<style lang="scss" scoped>
</style>
