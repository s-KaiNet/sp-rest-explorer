<template>
  <el-header class="app-header" height="90">
    <top-line></top-line>
    <div class="links">
      <router-link class="link" to="/" :class="linkActive" :exact="true">Explore</router-link>
      <router-link class="link" to="/api-diff">API Changelog</router-link>
      <router-link class="link" to="/how-it-works" :exact="true">How it works</router-link>
    </div>
  </el-header>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router'
import TopHeaderLine from './TopHeaderLine.vue'
import { consts } from '../../services/consts'

export default Vue.extend({
  components: {
    'top-line': TopHeaderLine
  },
  data() {
    return {
      linkActive: null
    }
  },
  watch: {
    $route(to: Route): void {
      if (to.path.indexOf(consts.apiPrefix) !== -1) {
        this.linkActive = 'router-link-active'
      } else {
        this.linkActive = ''
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.app-header {
  background-color: #006cc6;
  border-top: 4px solid white;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.2), 0 3px 4px 0 rgba(0, 0, 0, 0.14),
    0 3px 3px -2px rgba(0, 0, 0, 0.12);
  z-index: 2;

  .links {
    justify-content: flex-start;
    display: flex;
  }
  .link {
    color: $textColor;
    opacity: 0.5;
    font-size: 16px;
    font-family: $textFontFamily;
    text-decoration: none;
    margin: 8px 30px 10px 6px;

    &.router-link-active {
      opacity: 1;
    }
    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
