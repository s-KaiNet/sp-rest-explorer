<template>
  <div class="explorer-container">
    <el-aside width="auto" class="aside">
      <api-tree></api-tree>
    </el-aside>
    <div class="content">
      <breadcrumb />
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ApiTree from '@/components/ApiTree.vue'
import BreadCrumb from '@/components/BreadCrumb.vue'

export default Vue.extend({
  name: 'explorer',
  components: {
    'api-tree': ApiTree,
    breadcrumb: BreadCrumb
  }
})
</script>

<style lang="scss" scoped>
.explorer-container {
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;

  .content {
    width: 100%;
  }
  .aside {
    min-width: 230px;
    flex-shrink: 0;
  }
  .aside,
  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
  }
}
</style>
