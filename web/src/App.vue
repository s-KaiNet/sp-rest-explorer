<template>
  <div id="app">
    <app-header></app-header>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import AppHeader from '@/components/AppHeader.vue'

Vue.use(ElementUI)

export default Vue.extend({
  name: 'App',
  components: {
    'app-header': AppHeader
  }
})
</script>

<style lang="scss">
#app {

}
</style>
