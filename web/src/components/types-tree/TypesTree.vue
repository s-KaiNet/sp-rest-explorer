<template>
  <div class="types-tree">
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
      scrolled: false
    }
  },
  props: {
    typeName: String
  },

  updated() {
    if (this.typeName && !this.scrolled) {
      let element = this.$refs.typesList.querySelector('.active')
      element.scrollIntoView({
        behavior: 'auto',
        block: 'center'
      })
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
  .typesList {
    list-style: none;
    text-align: left;
    padding-left: 0;

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
