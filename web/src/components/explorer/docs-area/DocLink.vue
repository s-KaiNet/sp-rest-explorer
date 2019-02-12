<template>
  <span
    class="doc-link"
    :class="{fullWidth: fullWidth}"
  >
    <template v-if="isRouterLink">
      <router-link
        v-if="docLinkType === 1"
        class="link"
        :class="{underlined: underlined, fullWidth: fullWidth}"
        :to="'/entity/' + fullTypeName"
      >{{fullTypeName}}</router-link>
      <router-link
        v-else-if="docLinkType === 0"
        class="link"
        :to="'/entity/' + entityFullName + '/func/' + fullTypeName"
      >{{fullTypeName}}</router-link>
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
    docLinkType: Number,
    underlined: {
      type: Boolean,
      default: true
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" scoped>
.doc-link {
  &.fullWidth {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
  .link {
    color: inherit;
    text-decoration: none;
    &.underlined {
      border-bottom: 2px dashed #5293fd;
    }
    &.fullWidth {
      display: inline-block;
      width: 100%;
      height: 100%;
      padding: 4px 0;
    }
  }
}
</style>
