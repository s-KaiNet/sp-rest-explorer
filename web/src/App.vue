<template>
  <div id="app">
    <app-header></app-header>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ElementUI from 'element-ui'
const locale = require('element-ui/lib/locale/lang/en')
import 'element-ui/lib/theme-chalk/index.css'

import AppHeader from '@/components/header/AppHeader.vue'

Vue.use(ElementUI, { locale })

export default Vue.extend({
  components: {
    'app-header': AppHeader
  }
})
</script>

<style lang="scss">

</style>
