import Vue from 'vue'
import 'es6-promise/auto'
import axios from 'axios'

import App from './App.vue'
import router from './router'
import store from './store'

const VueAxios = require('vue-axios')

import './sass/main.scss'

Vue.use(VueAxios, axios)

Vue.config.productionTip = false

// tslint:disable-next-line:no-unused-expression
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
