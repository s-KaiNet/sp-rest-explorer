<template>
  <span class="doc-link">
    <template v-if="isRouterLink">
      <router-link v-if="docLinkType === 1" class="link" :to="'/entity/' + fullTypeName">{{fullTypeName}}</router-link>
      <router-link v-else-if="docLinkType === 0" class="link" :to="'/entity/' + entityFullName + '/func/' + fullTypeName">{{fullTypeName}}</router-link>
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
    docLinkType: Number
  }
})
</script>

<style lang="scss" scoped>
.doc-link {
  .link {
    color: inherit;
    text-decoration: none;
    border-bottom: 2px dashed #0e69ff91;
  }
}
</style>
