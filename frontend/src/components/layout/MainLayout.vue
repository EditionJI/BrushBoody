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
    </div>

    <router-view />
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
  z-index: 100;
  padding-top: env(safe-area-inset-top, 0px);
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
</style>
