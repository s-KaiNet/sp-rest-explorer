<template>
  <el-container>
    <el-aside width="auto">
      <api-tree></api-tree>
    </el-aside>
    <el-main>
        <router-view />
    </el-main>
  </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
import ApiTree from '@/components/ApiTree.vue'

export default Vue.extend({
  name: 'explorer',
  components: {
    'api-tree': ApiTree
  }
})
</script>

<style>

</style>
