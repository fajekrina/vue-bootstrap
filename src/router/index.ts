import { createRouter, createWebHistory } from 'vue-router'
import ScreenPage from '../pages/ScreenPage.vue'
import AdminBuilderPage from '../pages/AdminBuilderPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'
import { DEFAULT_MERCHANT, DEFAULT_SCREEN, specScreenKey } from '../sdui/config'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/admin/builder', component: AdminBuilderPage },
    {
      path: '/:merchantId/:screenKey',
      component: ScreenPage,
      // a 0.3.x URL (`/merchant_demo/seat-selection`) → the spec key, query kept
      beforeEnter: (to) => {
        const key = String(to.params.screenKey)
        const spec = specScreenKey(key)
        return spec === key ? true : { path: `/${String(to.params.merchantId)}/${spec}`, query: to.query, replace: true }
      }
    },
    { path: '/:merchantId', redirect: (to) => `/${to.params.merchantId}/${DEFAULT_SCREEN}` },
    { path: '/', redirect: `/${DEFAULT_MERCHANT}/${DEFAULT_SCREEN}` },
    { path: '/:pathMatch(.*)*', component: NotFoundPage }
  ]
})
