import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '../stores/app'

const routes = [
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('../pages/onboarding/OnboardingView.vue'),
    meta: { hideBottomNav: true }
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/home/HomeView.vue')
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('../pages/create/CreateView.vue'),
    meta: { hideBottomNav: true }
  },
  {
    path: '/stories',
    name: 'stories',
    component: () => import('../pages/stories/StoriesView.vue')
  },
  {
    path: '/parents',
    name: 'parents',
    component: () => import('../pages/parents/ParentsView.vue')
  },
  {
    path: '/brushing',
    name: 'brushing',
    component: () => import('../pages/brushing/BrushingView.vue'),
    meta: { hideBottomNav: true }
  },
  {
    path: '/payment',
    name: 'payment',
    component: () => import('../pages/payment/PaymentView.vue'),
    meta: { hideBottomNav: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for onboarding
router.beforeEach((to, from, next) => {
  // Directly check localStorage to avoid Pinia store initialization issues
  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true'

  // If trying to access home and hasn't seen onboarding, redirect to onboarding
  if (to.path === '/' && !hasSeenOnboarding) {
    next('/onboarding')
    return
  }

  // If onboarding is done and trying to access onboarding page, redirect to home
  if (to.path === '/onboarding' && hasSeenOnboarding) {
    next('/')
    return
  }

  next()
})

export default router
