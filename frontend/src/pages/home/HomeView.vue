<template>
  <div class="home-container">
    <div
      class="mobile-wrapper"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Slides Container - Vertical scroll -->
      <div class="slides-wrapper" :style="{ transform: `translateY(-${currentSlide * 100}%)` }">
        <div v-for="(image, index) in homeImages" :key="index" class="slide">
          <img :src="image" :alt="`首页${index + 1}`" class="slide-full-image" />
        </div>
      </div>

      <!-- Dots Indicator (right side) -->
      <div class="dots-indicator-vertical">
        <span
          v-for="(_, index) in homeImages"
          :key="index"
          class="dot"
          :class="{ active: index === currentSlide }"
          @click.stop="goToSlide(index)"
        ></span>
      </div>

      <!-- Bottom Menu Click Areas - 4 icons from UI -->
      <div class="bottom-menu">
        <div class="menu-click-area home-menu" @click.stop="goToHome"></div>
        <div class="menu-click-area create-menu" @click.stop="goToCreate"></div>
        <div class="menu-click-area stories-menu" @click.stop="goToStories"></div>
        <div class="menu-click-area parents-menu" @click.stop="goToParents"></div>
      </div>

      <!-- Create button click area (for new user) -->
      <div v-if="currentSlide === 0" class="create-button-area" @click.stop="goToCreate"></div>

      <!-- Story card click areas -->
      <div v-if="currentSlide === 0" class="story-card-area" @click.stop="viewStory"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentSlide = ref(0)

const homeImages = computed(() => {
  return [
    '/images/home-new-user-1.png',
    '/images/home-new-user-2.png',
    '/images/home-new-user-3.png'
  ]
})

const goToHome = () => {
  currentSlide.value = 0
}

const goToCreate = () => {
  router.push('/create')
}

const goToStories = () => {
  router.push('/stories')
}

const goToParents = () => {
  router.push('/parents')
}

const viewStory = () => {
  router.push('/stories')
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

// Touch swipe support for vertical scrolling
let touchStartY = 0
let touchCurrentY = 0

const handleTouchStart = (e: TouchEvent) => {
  touchStartY = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
  touchCurrentY = e.touches[0].clientY
}

const handleTouchEnd = () => {
  const swipeThreshold = 50
  const diff = touchStartY - touchCurrentY

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe up - next slide
      if (currentSlide.value < homeImages.value.length - 1) {
        currentSlide.value++
      }
    } else {
      // Swipe down - previous slide
      if (currentSlide.value > 0) {
        currentSlide.value--
      }
    }
  }

  touchStartY = 0
  touchCurrentY = 0
}
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #FFF9F0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-wrapper {
  position: relative;
  width: min(375px, 100vw, calc(100vh * 375 / 812));
  aspect-ratio: 375 / 812;
  height: min(100vh, calc(100vw * 812 / 375));
  overflow: hidden; /* Hide overflow from slides */
  background: white;
}

.slides-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%; /* Match wrapper height */
  transition: transform 0.3s ease;
}

.slide {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  position: relative;
}

.slide-full-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Contain to show full image without cropping */
  display: block;
}

/* Dots Indicator - Right side, vertical */
.dots-indicator-vertical {
  position: absolute; /* Relative to mobile-wrapper */
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 20;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.dot.active {
  width: 8px;
  height: 24px; /* Vertical active dot style */
  border-radius: 4px;
  background: rgba(255, 107, 107, 0.9);
}

/* Button click areas - Using percentage positioning */
.create-button-area {
  position: absolute;
  bottom: 22%; /* Approx 180px / 812px */
  left: 50%;
  transform: translateX(-50%);
  width: 75%; /* 280px / 375px */
  height: 7.5%; /* 60px / 812px */
  z-index: 10;
  cursor: pointer;
  /* background: rgba(255, 0, 0, 0.2); Debug */
}

.story-card-area {
  position: absolute;
  top: 22%; /* 180px / 812px */
  left: 50%;
  transform: translateX(-50%);
  width: 85%; /* 320px / 375px */
  height: 46%; /* 380px / 812px */
  z-index: 10;
  cursor: pointer;
  /* background: rgba(0, 0, 255, 0.2); Debug */
}

/* Bottom Menu Click Areas */
.bottom-menu {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 10%; /* Approx 80px / 812px */
  display: flex;
  z-index: 100;
}

.menu-click-area {
  flex: 1;
  height: 100%;
  cursor: pointer;
  background: transparent;
}

.menu-click-area:active {
  background: rgba(0, 0, 0, 0.05);
}
</style>
