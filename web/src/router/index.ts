import Vue from 'vue'
import Router from 'vue-router'

import Explorer from '@/components/Explorer.vue'
import HowItWorks from '@/components/HowItWorks.vue'
import ExplorerHome from '@/components/ExplorerHome.vue'
import TypeDetails from '@/components/TypeDetails.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Explorer,
      children: [
        {
          path: '',
          component: ExplorerHome
        },
        {
          path: 'type/method/:name',
          component: TypeDetails
        },
        {
          path: 'type/:name',
          component: TypeDetails
        }
      ]
    },
    {
      path: '/how-it-works',
      component: HowItWorks
    }
  ]
})
