<template>
  <div class="api-tree">
    <div class="apiLabel">_api/</div>
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

import { ApiService } from '../../services/api'
import { uiTypes } from '../../store/modules/ui'
import { navigationTypes } from '../../store/modules/navigation'
import { TreeBuilder } from '../../services/treeBuilder'
import { TreeNode } from '../../models/TreeNode'
import { Metadata } from '../../../../parser/src/interfaces'

interface Data {
  treeProps: any
}

let metadata: Metadata

export default Vue.extend({
  name: 'api-tree',
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
        let api = new ApiService()
        api
          .getMetaData()
          .then(data => {
            this.$store.commit(uiTypes.SET_DATA_LOADING, {
              loading: false
            })
            metadata = data

            let treeBuilder = new TreeBuilder(metadata)
            resolve(treeBuilder.buildRootTree())
          })
          .catch(err => {
            throw err
          })
      }
      if (node.level > 0) {
        let treeBuilder = new TreeBuilder(metadata)
        resolve(treeBuilder.getChildren(node.data))
      }
    },
    nodeCllick(node: TreeNode) {
      this.$store.commit(navigationTypes.SET_BREADCRUMB, {
        breadcrumb: node.path
      })
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

  .apiLabel {
    margin: 10px;
    text-align: left;
    font-size: 17px;
    font-weight: bold;
    font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
      Arial, sans-serif;
  }
}
</style>

