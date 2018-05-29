<template>
  <div class="api-tree">
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
import { filterTypes } from '../../store/modules/filters'

interface Data {
  treeProps: any,
  refreshing: boolean
}

export default Vue.extend({
  mixins: [metadataMixin],
  data(): Data {
    return {
      refreshing: false,
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
        let treeBuilder = new TreeBuilder(this.metadata)
        resolve(treeBuilder.buildRootTree())
      }
      if (node.level > 0) {
        let treeBuilder = new TreeBuilder(this.metadata)
        resolve(treeBuilder.getChildren(node.data))
      }
    },
    nodeCllick(node: TreeNode) {
      this.$router.push('/' + consts.apiPrefix + '/' + node.path)
    }
  },
  mounted() {
    let self = this
    setTimeout(() => {
      self.$store.commit(filterTypes.ADD_FILTERS, {
        filters: ['SP.WorkflowServices']
      })
    }, 5000)
  },
  watch: {
    metadata(data: any) {
      console.log(data)
      this.refreshing = true
      Vue.nextTick(() => {
        this.refreshing = false
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
}
</style>

