<template>
  <div class="explorer-container" v-loading="loading">
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
import ApiTree from '@/components/api-tree/ApiTree.vue'
import BreadCrumb from '@/components/explorer/BreadCrumb.vue'

export default Vue.extend({
  name: 'explorer',
  components: {
    'api-tree': ApiTree,
    breadcrumb: BreadCrumb
  },
  computed: {
    loading(): boolean {
      return this.$store.state.ui.dataLoading
    }
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
    min-width: 250px;
    max-width: 500px;
    flex-shrink: 0;
    background-color: #e5e9f2;
    box-shadow: 1px 0px 8px 0 rgba(0, 0, 0, 0.2),
      3px 0 4px 0 rgba(0, 0, 0, 0.14), 3px 0 3px -2px rgba(0, 0, 0, 0.12);
    z-index: 1;
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
