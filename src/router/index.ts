import { createRouter, createWebHistory } from 'vue-router'

const AboutView = () => import('../views/AboutView.vue')
const WorkspaceView = () => import('../views/WorkspaceView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'workspace',
      component: WorkspaceView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior() {
    return { top: 0, left: 0 }
  }
})

export default router

