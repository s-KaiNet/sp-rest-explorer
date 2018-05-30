<template>
  <div class="api-tree">
    <filters-dialog />
    <el-tooltip class="item" effect="light" content="Filters out the first level of the tree. Minimum 3 letters required." placement="bottom">
      <el-input size="small" class="search" placeholder="Search" prefix-icon="el-icon-search" v-model="search" :clearable="true"> </el-input>
    </el-tooltip>
    <div class="content" v-if="!refreshing">
      <el-tree :expand-on-click-node="false" :props="treeProps" lazy :load="expandNode" @node-click="nodeCllick" class="tree">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { consts } from '../../services/consts'
import { TreeBuilder } from '../../services/treeBuilder'
import { TreeNode } from '../../models/TreeNode'
import { metadataMixin } from '../../mixins'
import FiltersDialog from './FiltersDialog.vue'
import { filterTypes } from './../../store/modules/filters'

interface Data {
  treeProps: any
  refreshing: boolean
  search: string
}

export default Vue.extend({
  components: {
    'filters-dialog': FiltersDialog
  },
  mixins: [metadataMixin],
  data(): Data {
    return {
      refreshing: false,
      search: '',
      treeProps: {
        label: 'label',
        children: 'children',
        isLeaf: 'leaf'
      }
    }
  },
  methods: {
    expandNode(node: any, resolve: (data: TreeNode[]) => void): void {
      if (node.level === 0) {
        let treeBuilder = new TreeBuilder(this.metadata)
        resolve(treeBuilder.buildRootTree())
      }
      if (node.level > 0) {
        let treeBuilder = new TreeBuilder(this.metadata)
        resolve(treeBuilder.getChildren(node.data))
      }
    },
    nodeCllick(node: TreeNode): void {
      this.$router.push('/' + consts.apiPrefix + '/' + node.path)
    }
  },
  watch: {
    metadata(data: any) {
      this.refreshing = true
      Vue.nextTick(() => {
        this.refreshing = false
      })
    },
    search(value: string) {
      this.$store.commit(filterTypes.SET_SEARCH, {
        search: value.length > 2 ? value : ''
      })
    }
  }
})
</script>

<style lang="scss" scoped>
$color: #606266;
.api-tree {
  display: inline-block;
  white-space: nowrap;
  min-width: 100%;
  text-align: left;

  .search {
    width: 230px;
    margin: 10px;
  }

  .tree {
    background-color: #e5e9f2;
  }

  .info {
    font-style: italic;
    border: 1px solid black;
    padding: 10px;
  }
}
</style>

