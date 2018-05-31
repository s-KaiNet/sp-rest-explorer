<template>
  <span class="doc-link">
    <template v-if="isRouterLink">
      <router-link class="link" v-if="!isFunction" :to="'/entity/' + fullTypeName">{{fullTypeName}}</router-link>
      <router-link class="link" v-if="isFunction" :to="'/entity/' + entityFullName + '/' + fullTypeName">{{fullTypeName}}</router-link>
    </template>
    <template v-else>
      {{getPropertyName(fullTypeName)}}
    </template>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

import { docsMixin } from '../../../mixins'

export default Vue.extend({
  mixins: [docsMixin],
  computed: {
    isRouterLink(): boolean {
      return this.fullTypeName.indexOf('Edm.') !== 0
    },
    isCollection(): boolean {
      return this.fullTypeName.indexOf('Collection(') === 0
    }
  },
  props: {
    fullTypeName: String,
    entityFullName: String,
    isFunction: Boolean
  }
})
</script>

<style lang="scss" scoped>
.doc-link {
  .link {
    color: inherit;
    text-decoration: none;
    border-bottom: 2px dashed #0e69ff;
  }
}
</style>
