<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './components/layout/MainLayout.vue'

const route = useRoute()

// All pages use MainLayout, BottomNav component will handle visibility
const layoutComponent = computed(() => {
  // Only login and onboarding pages don't use MainLayout
  const noLayoutRoutes = ['/login', '/onboarding']
  return noLayoutRoutes.includes(route.path) ? 'div' : MainLayout
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: fixed;
}

body {
  font-family: 'Comic Sans MS', 'Chalkboard SE', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* Support for safe-area-inset on iOS devices */
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}

#app {
  width: 100%;
  /* Use CSS variable for dynamic viewport height (fixes iOS Safari issue) */
  height: calc(var(--vh, 1vh) * 100);
  position: relative;
}
</style>
