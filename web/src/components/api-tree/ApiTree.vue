<template>
  <div class="api-tree">
    <filters-dialog />
    <el-tooltip
      class="item"
      effect="light"
      content="Filters out the root level of the tree. Minimum 3 letters required."
      placement="right"
    >
      <el-input
        size="small"
        class="search"
        placeholder="Search"
        prefix-icon="el-icon-search"
        v-model="search"
        :clearable="true"
      > </el-input>
    </el-tooltip>
    <div
      class="content"
      v-if="!refreshing"
      ref="tree"
    >
      <el-tree
        node-key="path"
        :default-expanded-keys="getDefaultExpanded()"
        :expand-on-click-node="false"
        :props="treeProps"
        lazy
        :load="expandNode"
        @node-click="nodeCllick"
        class="tree"
      >
        <span
          class="custom-tree-node"
          slot-scope="{ node, data }"
          :class="{current: data.path === apiPath}"
        >
          <img
            class="funcIcon"
            src="../../assets/func-icon.png"
            v-if="node.level > 1 && data.type === 1"
          >
          <img
            class="propIcon"
            src="../../assets/nav-prop-icon.png"
            v-if="node.level > 1 && data.type === 0"
          >
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
  scrolled: boolean
}

export default Vue.extend({
  components: {
    'filters-dialog': FiltersDialog
  },
  mixins: [metadataMixin],
  props: {
    apiPath: String
  },
  data(): Data {
    return {
      refreshing: false,
      search: '',
      scrolled: false,
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
    getDefaultExpanded(): any[] {
      let defaultExpanded = []

      if (this.apiPath) {
        let apiPathParts = this.apiPath.split(consts.pathSeparator)
        apiPathParts.pop()

        let currentPath = ''
        for (const apiPath of apiPathParts) {
          if (currentPath) {
            defaultExpanded.push(currentPath + consts.pathSeparator + apiPath)
          } else {
            defaultExpanded.push(apiPath)
          }

          currentPath = defaultExpanded[defaultExpanded.length - 1]
        }
      }
      return defaultExpanded
    },
    nodeCllick(node: TreeNode): void {
      this.$router.push('/' + consts.apiPrefix + '/' + node.path)
    }
  },
  mounted() {
    let element = (this.$refs.tree as HTMLElement).querySelector('.current')
    if (element) {
      element.scrollIntoView({
        behavior: 'auto',
        block: 'center'
      })
      element.parentElement.parentElement.classList.add('is-current')
      element.parentElement.parentElement.focus()
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

  .propIcon {
    width: 10px;
    vertical-align: baseline;
  }

  .funcIcon {
    width: 10px;
    vertical-align: middle;
  }

  .search {
    width: 230px;
    margin: 10px;
  }

  .tree {
    background-color: #dae0ec;
  }

  .info {
    font-style: italic;
    border: 1px solid black;
    padding: 10px;
  }
}
</style>

