import Vue from 'vue'
import Router from 'vue-router'

import Explorer from '@/components/explorer/Explorer.vue'
import HowItWorks from '@/components/pages/HowItWorks.vue'
import DocsView from '@/components/explorer/docs-area/DocsView.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Explorer,
      children: [
        {
          path: '',
          component: DocsView
        },
        {
          path: '_api/*',
          component: DocsView
        }
      ]
    },
    {
      path: '/how-it-works',
      component: HowItWorks
    }
  ]
})
