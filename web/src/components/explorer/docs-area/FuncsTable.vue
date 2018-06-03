<template>
  <div v-if="funcs && funcs.length > 0" class="props-table">
    <h5 class="attributeName">{{title}}</h5>
    <table class="objectGroup">
      <thead>
        <tr>
          <th>Name</th>
          <th>Return Type</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="func in funcs" :key="func.name">
          <td>
            <doc-link :full-type-name="func.name" :doc-link-type="0" :entity-full-name="entity.fullName" />
          </td>
          <td>
            <template v-if="func.returnType">
              <doc-link :full-type-name="func.returnType" :doc-link-type="1" />
            </template>
            <template v-else>-</template>
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
  computed: {
    funcs(): any[] {
      return this.entity.functions
    }
  },
  props: {
    entity: {
      type: Object,
      required: true
    },
    title: String
  }
})
</script>

<style lang="scss" scoped>
</style>
