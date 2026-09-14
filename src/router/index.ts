import { createRouter, createWebHistory } from 'vue-router'
import UniversalPage from '../pages/UniversalPage.vue'
import AdminBuilderPage from '../pages/AdminBuilderPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/admin/builder', component: AdminBuilderPage },
    { path: '/:merchantId/:pageKey', component: UniversalPage },
    { path: '/:merchantId', redirect: (to) => `/${to.params.merchantId}/home` },
    { path: '/', redirect: '/merchant_demo/home' },
    { path: '/:pathMatch(.*)*', component: NotFoundPage }
  ]
})
