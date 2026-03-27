<template>
  <div class="onboarding-container">
    <div
      class="mobile-wrapper"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @click="handleSlideClick"
    >
      <!-- Slides Container - Full screen UI images -->
      <div class="slides-wrapper" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div v-for="(slide, index) in slides" :key="index" class="slide">
          <img :src="slide.image" :alt="`引导页${index + 1}`" class="slide-full-image" />

          <!-- Clickable button area at bottom center -->
          <div class="button-click-area" @click.stop="handleButtonClick"></div>
        </div>
      </div>

      <!-- Dots Indicator -->
      <div class="dots-indicator">
        <span
          v-for="(_, index) in slides"
          :key="index"
          class="dot"
          :class="{ active: index === currentSlide }"
          @click.stop="goToSlide(index)"
        ></span>
      </div>

      <!-- Skip Button -->
      <button
        v-if="currentSlide < slides.length - 1"
        @click.stop="completeOnboarding"
        class="skip-button"
      >
        Skip
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/app'

const router = useRouter()
const appStore = useAppStore()

const currentSlide = ref(0)

// Onboarding slides content - using actual UI design images
const slides = [
  {
    image: '/images/onboarding-slide1.png',
    title: 'Welcome to BrushBuddy',
    description: 'Make brushing fun and build healthy habits'
  },
  {
    image: '/images/onboarding-slide3.png',
    title: 'Fun Brushing Experience',
    description: 'Follow story characters while brushing - 2 minutes fly by!'
  },
  {
    image: '/images/onboarding-slide5.png',
    title: 'Peace of Mind for Parents',
    description: 'Track your child\'s brushing progress anytime'
  }
]

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
  } else {
    completeOnboarding()
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const completeOnboarding = () => {
  appStore.completeOnboarding()
  router.push('/login')
}

// Touch swipe support
let touchStartX = 0
let touchEndX = 0

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].screenX
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  const swipeThreshold = 50
  const diff = touchStartX - touchEndX

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next slide
      nextSlide()
    } else {
      // Swipe right - previous slide
      prevSlide()
    }
  }
}

const handleSlideClick = () => {
  // Click anywhere on the slide to go to next
  nextSlide()
}

const handleButtonClick = () => {
  // Click on button area at bottom
  if (currentSlide.value === slides.length - 1) {
    // Last slide - complete onboarding
    completeOnboarding()
  } else {
    // Go to next slide
    nextSlide()
  }
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}
</script>

<style scoped>
.onboarding-container {
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);
  position: relative;
  overflow: hidden;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-wrapper {
  position: relative;
  width: min(390px, 100vw, calc(var(--vh, 1vh) * 100 * 390 / 844));
  aspect-ratio: 390 / 844;
  height: min(calc(var(--vh, 1vh) * 100), calc(100vw * 844 / 390));
  overflow: hidden;
  background: #000;
}

.slides-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.slide {
  min-width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.slide-full-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  pointer-events: none;
}

.button-click-area {
  position: absolute;
  bottom: 10%; /* Approx 84px / 844px */
  left: 50%;
  transform: translateX(-50%);
  width: 51%; /* 200px / 390px */
  height: 7%; /* 60px / 844px */
  z-index: 20;
  /* Transparent but clickable - covers the button area in UI */
}

.dots-indicator {
  position: absolute;
  bottom: 5%; /* Approx 42px / 844px */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.dot.active {
  width: 24px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
}

.skip-button {
  position: absolute;
  top: 2.5%; /* Approx 21px / 844px */
  right: 5%; /* Approx 20px / 375px */
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  z-index: 10;
}

.skip-button:active {
  background: rgba(255, 255, 255, 0.3);
}
</style>
