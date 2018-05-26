<template>
  <div v-if="funcs && funcs.length > 0" class="props-table">
    <h5 class="attributeName">
      <i class="el-icon-minus"></i> {{title}}</h5>
    <table class="objectGroup">
      <thead>
        <tr>
          <th>Name</th>
          <th>Return Type</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="func in funcs" :key="func.name">
          <td>{{func.name}}</td>
          <td>{{func.returnType ? getPropertyName(func.returnType): '-'}}</td>
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
    funcs: Array,
    title: String
  }
})
</script>

<style lang="scss" scoped>
</style>
