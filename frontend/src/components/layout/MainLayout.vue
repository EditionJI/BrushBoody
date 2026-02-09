<template>
  <div class="main-layout">
    <!-- Top Navigation Bar -->
    <div v-if="showTopNav" class="top-nav">
      <img
        src="/images/创建页/返回.png"
        alt="Back"
        class="back-button"
        @click="goBack"
      />
      <h1 v-if="pageTitle" class="page-title">{{ pageTitle }}</h1>
    </div>

    <!-- Content Area -->
    <div class="content-area" :class="{ 'has-top-nav': showTopNav, 'has-bottom-nav': !hideBottomNav }">
      <router-view />
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BottomNav from './BottomNav.vue'

const router = useRouter()
const route = useRoute()

// Show top nav on pages that need it (not home, create)
const showTopNav = computed(() => {
  const hideTopNavRoutes = ['/', '/login', '/onboarding', '/create', '/brushing', '/payment']
  return !hideTopNavRoutes.includes(route.path)
})

// Get page title from route meta
const pageTitle = computed(() => route.meta?.title as string || '')

// Check if bottom nav is visible
const hideBottomNav = computed(() => route.meta?.hideBottomNav === true)

const goBack = () => {
  if (window.history.state && window.history.state.back) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.main-layout {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.top-nav {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding-top: env(safe-area-inset-top, 0px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.back-button {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  cursor: pointer;
  z-index: 101;
  pointer-events: auto;
}

.back-button:active {
  opacity: 0.7;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #111111;
  margin: 0;
  text-align: center;
}

.content-area {
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
}

.content-area.has-top-nav {
  padding-top: calc(54px + env(safe-area-inset-top, 0px));
}

.content-area.has-bottom-nav {
  padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
}
</style>
