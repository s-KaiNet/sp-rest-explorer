<template>
  <div class="api-tree">
    <div class="content">
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

import { Api } from '../../services/api'
import { consts } from '../../services/consts'
import { TreeBuilder } from '../../services/treeBuilder'
import { TreeNode } from '../../models/TreeNode'

interface Data {
  treeProps: any
}

export default Vue.extend({
  data(): Data {
    return {
      treeProps: {
        label: 'label',
        children: 'children',
        isLeaf: 'leaf'
      }
    }
  },
  methods: {
    expandNode(node: any, resolve: (data: TreeNode[]) => void) {
      if (node.level === 0) {
        let treeBuilder = new TreeBuilder(Api.Metadata)
        resolve(treeBuilder.buildRootTree())
      }
      if (node.level > 0) {
        let treeBuilder = new TreeBuilder(Api.Metadata)
        resolve(treeBuilder.getChildren(node.data))
      }
    },
    nodeCllick(node: TreeNode) {
      this.$router.push('/' + consts.apiPrefix + '/' + node.path)
    }
  }
})
</script>

<style lang="scss" scoped>
.api-tree {
  display: inline-block;
  white-space: nowrap;
  min-width: 100%;
  margin-right: 10px;

  .tree {
    background-color: #e5e9f2;
  }
}
</style>

