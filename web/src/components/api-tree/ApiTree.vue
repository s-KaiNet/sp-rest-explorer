<template>
  <div class="api-tree">
    <div class="content">
      <el-tree :data="functions" :expand-on-click-node="false" default-expand-all class="tree">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span>
            <el-button type="text" size="mini" v-if="data.hasChilds" @click="() => expandNode(data)">
              Expand
            </el-button>
          </span>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { ApiService } from '../../services/api'
import { uiTypes } from '../../store/modules/ui'
import { TreeBuilder } from '../../services/treeBuilder'
import { ITreeNode } from '../../models/ITreeNode'
import { Metadata } from '../../../../parser/src/interfaces'

interface IData {
  functions: any[]
  data: any
}

let metadata: Metadata

export default Vue.extend({
  name: 'api-tree',
  data(): IData {
    return {
      data: null,
      functions: []
    }
  },
  methods: {
    expandNode(node: ITreeNode) {
      let treeBuilder = new TreeBuilder(metadata)
      let children = treeBuilder.getChildren(node)

      node.children = children
    }
  },
  mounted() {
    let api = new ApiService()
    api
      .getMetaData()
      .then(data => {
        this.$store.commit(uiTypes.SET_DATA_LOADING, {
          loading: false
        })
        metadata = data

        let treeBuilder = new TreeBuilder(data)
        this.functions = treeBuilder.buildRootTree()
      })
      .catch(err => {
        throw err
      })
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

