<template>
  <nav v-if="isVisible" class="bottom-nav">
    <router-link to="/" class="nav-item" :class="{ active: currentRoute === 'home' }">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
      <span>首页</span>
    </router-link>

    <router-link to="/create" class="nav-item" :class="{ active: currentRoute === 'create' }">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <span>Create</span>
    </router-link>

    <router-link to="/stories" class="nav-item" :class="{ active: currentRoute === 'stories' }">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <span>绘本广场</span>
    </router-link>

    <router-link to="/parents" class="nav-item" :class="{ active: currentRoute === 'parents' }">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <span>父母看板</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRoute = ref('')

// Check if bottom nav should be visible for current route
const isVisible = computed(() => {
  const hideNavRoutes = ['/onboarding', '/create', '/brushing', '/payment']
  return !hideNavRoutes.includes(route.path)
})

// Update current route name
const updateRoute = () => {
  currentRoute.value = route.name?.toString().split('-')[0] || ''
}

onMounted(() => {
  updateRoute()
})

watch(() => route.path, () => {
  updateRoute()
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 8px 0 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: #A0AEC0;
  transition: color 0.3s ease;
  padding: 4px 12px;
}

.nav-item:hover,
.nav-item.router-link-active,
.nav-item.active {
  color: #FF6B6B;
}

.nav-item svg {
  transition: transform 0.2s ease;
}

.nav-item.active svg {
  transform: scale(1.1);
}

.nav-item span {
  font-size: 11px;
  font-weight: 500;
}
</style>
