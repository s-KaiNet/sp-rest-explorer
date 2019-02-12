import Vue from 'vue'
import 'es6-promise/auto'
import axios from 'axios'
import { AppInsights } from 'applicationinsights-js'
const smoothscroll = require('smoothscroll-polyfill')

import App from './App.vue'
import router from './router'
import store from './store'

smoothscroll.polyfill()

const VueAxios = require('vue-axios')

import './sass/main.scss'

if (process.env.NODE_ENV === 'production') {
  AppInsights.downloadAndSetup({
    instrumentationKey: '88b60418-430f-416c-b4c3-dc4392385c3b'
  })
  AppInsights.trackPageView()
}

Vue.use(VueAxios, axios)

Vue.config.productionTip = false

// tslint:disable-next-line:no-unused-expression
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
