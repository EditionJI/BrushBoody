import { createApp } from 'vue'
import { createPinia } from 'pinia'
import posthog from 'posthog-js'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Initialize PostHog
posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  person_profiles: 'identified_only',
  capture_pageview: false, // We will handle this manually via router
})

// Track page views via Router
router.afterEach((to) => {
  posthog.capture('$pageview', {
    $current_url: window.location.origin + to.fullPath
  })
})

app.use(createPinia())
app.use(router)

app.mount('#app')
