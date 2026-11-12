import { createRouter, createWebHistory } from 'vue-router'
import ScreenPage from '../pages/ScreenPage.vue'
import AdminBuilderPage from '../pages/AdminBuilderPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'
import { DEFAULT_MERCHANT, DEFAULT_SCREEN } from '../sdui/config'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/admin/builder', component: AdminBuilderPage },
    { path: '/:merchantId/:screenKey', component: ScreenPage },
    { path: '/:merchantId', redirect: (to) => `/${to.params.merchantId}/${DEFAULT_SCREEN}` },
    { path: '/', redirect: `/${DEFAULT_MERCHANT}/${DEFAULT_SCREEN}` },
    { path: '/:pathMatch(.*)*', component: NotFoundPage }
  ]
})
