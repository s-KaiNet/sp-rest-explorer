<template>
  <div id="app">
    <app-header></app-header>
    <router-view v-if="loaded" />
    <div v-if="!loaded" class="loading" v-loading="loading"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ElementUI from 'element-ui'
import { AppInsights } from 'applicationinsights-js'
const locale = require('element-ui/lib/locale/lang/en')
import 'element-ui/lib/theme-chalk/index.css'

import AppHeader from '@/components/header/AppHeader.vue'
import { Api } from './services/api'
import { uiTypes } from './store/modules/ui'
import { Logger } from './services/logger'

if (process.env.NODE_ENV === 'production') {
  AppInsights.downloadAndSetup({
    instrumentationKey: '88b60418-430f-416c-b4c3-dc4392385c3b'
  })
  AppInsights.trackPageView()
}

Vue.use(ElementUI, { locale })

export default Vue.extend({
  data() {
    return {
      loaded: false
    }
  },
  computed: {
    loading(): boolean {
      return this.$store.state.ui.dataLoading
    }
  },
  components: {
    'app-header': AppHeader
  },
  mounted() {
    Api.getMetaData()
      .then(data => {
        this.$store.commit(uiTypes.SET_DATA_LOADING, {
          loading: false
        })
        this.loaded = true
      })
      .catch((err: any) => {
        Logger.Error(err)
        throw err
      })
  }
})
</script>

<style lang="scss">
.loading {
  height: 100%;
  width: 100%;
}
</style>
