<template>
  <div class="breadcrumb-menu" v-if="path">
    <div class="breadcrumb">
      <span>_api/{{path}}</span>
    </div>
    <div class="info" v-if="hasInfo">
      <div class="apiLink">
        <span>
          <i class="el-icon-info"></i>
        </span>
        This API has an official documentation here:
        <a :href="info.url" target="_blank">{{info.name}}</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { DocLinks } from '../../services/docLinks'
import { DocLink } from '../../models/DocLink'

export default Vue.extend({
  computed: {
    path(): string {
      return this.$store.state.navigation.breadcrumb
    },
    hasInfo(): boolean {
      return DocLinks.hasLink(this.path)
    },
    info(): DocLink {
      return DocLinks.getLink(this.path)
    }
  }
})
</script>

<style lang="scss" scoped>
.breadcrumb-menu {
  .breadcrumb {
    background-color: #cce5ff;
    padding: 15px;
    margin: 15px;
    border-radius: 4px;
    font-size: 17px;
    font-weight: bold;
    font-family: $textFontFamily;
  }

  .apiLink {
    margin: 10px 0;
  }

  .info {
    padding: 10px;
    margin: 15px 15px 0 15px;
    border-radius: 4px;
    font-size: 19px;
    font-weight: bold;
    background-color: #d4edda;
  }
}
</style>
