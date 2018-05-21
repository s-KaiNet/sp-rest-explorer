<template>
  <el-header class="app-header" height="90">
    <top-line></top-line>
    <div class="links">
      <router-link class="link" to="/" :exact="true">Home</router-link>
      <router-link class="link" to="/how-it-works" :exact="true">How it works</router-link>
    </div>
  </el-header>
</template>

<script lang="ts">
import Vue from 'vue'
import TopHeaderLine from '@/components/TopHeaderLine.vue'

export default Vue.extend({
  name: 'app-header',
  components: {
    'top-line': TopHeaderLine
  }
})
</script>

<style lang="scss" scoped>
.app-header {
  position: fixed;
  right: 8px;
  left: 8px;
  top: 0;
  background-color: #006cc6;
  border-top: 4px solid white;

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
