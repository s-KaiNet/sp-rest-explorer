import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

import 'es6-promise/auto'

const VueAxios = require('vue-axios')

import './sass/main.scss'

Vue.use(VueAxios, axios)

Vue.config.productionTip = false

// tslint:disable-next-line:no-unused-expression
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
