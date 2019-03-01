<template>
  <div class="types-tree">
    <div class="search">
      <el-tooltip
        class="item"
        effect="light"
        content="Minimum 3 letters required."
        placement="bottom"
      >
        <el-input
          size="small"
          placeholder="Search"
          prefix-icon="el-icon-search"
          v-model="search"
          :clearable="true"
        > </el-input>
      </el-tooltip>
    </div>
    <ul
      class="typesList"
      ref="typesList"
    >
      <li
        v-for="type in types"
        :key="type.fullName"
        :class="{active: typeName === type.fullName}"
      >
        <doc-link
          :full-type-name="type.fullName"
          :doc-link-type="1"
          :underlined="false"
          :full-width="true"
          :split-collection="false"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import DocLink from '../explorer/docs-area/DocLink.vue'
import { Api } from '../../services/api'
import { MetadataParser } from '../../services/metadataParser'

export default Vue.extend({
  components: {
    'doc-link': DocLink
  },
  data(): any {
    return {
      types: [],
      scrolled: false,
      search: ''
    }
  },
  props: {
    typeName: String
  },
  methods: {
    isScrolledIntoView(el: HTMLElement) {
      const rect = el.getBoundingClientRect()
      const elemTop = rect.top
      const elemBottom = rect.bottom

      // Only completely visible elements return true:
      const isVisible = elemTop >= 0 && elemBottom <= window.innerHeight
      // Partially visible elements return true:
      // isVisible = elemTop < window.innerHeight && elemBottom >= 0;
      return isVisible
    }
  },
  watch: {
    search(value: string) {
      if (!value || value.length > 2) {
        let parser = new MetadataParser(Api.getMetadata([]))
        this.types = parser.getEntities(value)
      }
    }
  },
  updated() {
    if (this.typeName) {
      let element = this.$refs.typesList.querySelector('.active')
      if (element && !this.isScrolledIntoView(element)) {
        element.scrollIntoView({
          behavior: 'auto',
          block: 'center'
        })
      }
      this.scrolled = true
    }
  },
  mounted() {
    if (this.typeName) {
      this.scrolled = false
    } else {
      this.scrolled = true
    }

    let parser = new MetadataParser(Api.getMetadata([]))
    this.types = parser.getEntities()
  }
})
</script>

<style lang="scss" scoped>
.types-tree {
  cursor: pointer;
  text-align: left;

  .search {
    width: 230px;
    margin: 10px;
    position: fixed;
    top: 90px;
  }

  .typesList {
    list-style: none;
    text-align: left;
    padding: 0;
    margin-top: 45px;

    li {
      padding-left: 15px;
      &:hover {
        background-color: #f5f7fa;
      }
      &.active {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>
