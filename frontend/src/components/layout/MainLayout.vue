<template>
  <div class="main-layout">
    <router-view />
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import BottomNav from './BottomNav.vue'
</script>

<style scoped>
.main-layout {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
