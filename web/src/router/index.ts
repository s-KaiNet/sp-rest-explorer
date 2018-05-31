import Vue from 'vue'
import Router from 'vue-router'

import Explorer from '@/components/explorer/Explorer.vue'
import HowItWorks from '@/components/pages/HowItWorks.vue'
import DocsView from '@/components/explorer/docs-area/DocsView.vue'
import BreadCrumb from '@/components/explorer/BreadCrumb.vue'
import FunctionDocs from '@/components/explorer/docs-area/FunctionDocs.vue'
import EntityDocs from '@/components/explorer/docs-area/EntityDocs.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Explorer,
      children: [
        {
          path: '',
          components: {
            docs: DocsView
          }
        },
        {
          path: '_api/*',
          components: {
            docs: DocsView,
            breadcrumb: BreadCrumb
          },
          children: [
            {
              path: '',
              components: {
                'entity-docs': EntityDocs,
                'function-docs': FunctionDocs
              }
            }
          ]
        },
        {
          path: 'entity/:typeName/:funcName',
          components: {
            docs: DocsView
          },
          children: [
            {
              path: '',
              components: {
                'function-docs': FunctionDocs
              }
            }
          ]
        },
        {
          path: 'entity/:typeName',
          components: {
            docs: DocsView
          },
          children: [
            {
              path: '',
              components: {
                'entity-docs': EntityDocs
              }
            }
          ]
        }
      ]
    },
    {
      path: '/how-it-works',
      component: HowItWorks
    }
  ]
})
