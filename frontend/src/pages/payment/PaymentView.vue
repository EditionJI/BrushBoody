<template>
  <div class="payment-container">
    <div
      class="mobile-wrapper"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Slides Container - Horizontal scroll -->
      <div class="slides-wrapper" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div v-for="(slide, index) in slides" :key="index" class="slide">
          <img :src="slide.image" :alt="`付费引导${index + 1}`" class="slide-full-image" />

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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentSlide = ref(0)

// Payment guide slides - 3 pages
const slides = [
  {
    image: '/images/payment-1.png',
    title: '解锁更多故事',
    description: '订阅即可解锁所有主题故事'
  },
  {
    image: '/images/payment-2.png',
    title: '多种订阅方案',
    description: '选择最适合您的订阅计划'
  },
  {
    image: '/images/payment-3.png',
    title: '立即开始',
    description: '完成订阅，开启刷牙冒险之旅'
  }
]

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
  } else {
    // Last slide - go to brushing page
    router.push('/brushing')
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const handleButtonClick = () => {
  if (currentSlide.value === slides.length - 1) {
    // Last slide - go to brushing page after payment
    router.push('/brushing')
  } else {
    // Go to next slide
    nextSlide()
  }
}

// Touch swipe support
let touchStartX = 0
let touchCurrentX = 0

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
}

const handleTouchMove = (e: TouchEvent) => {
  touchCurrentX = e.touches[0].clientX
}

const handleTouchEnd = () => {
  const swipeThreshold = 50
  const diff = touchStartX - touchCurrentX

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next slide
      if (currentSlide.value < slides.length - 1) {
        currentSlide.value++
      }
    } else {
      // Swipe right - previous slide
      if (currentSlide.value > 0) {
        currentSlide.value--
      }
    }
  }

  touchStartX = 0
  touchCurrentX = 0
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}
</script>

<style scoped>
.payment-container {
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
  overflow: hidden;
  background: #FFF9F0;
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
  bottom: 15%; /* Approx 120px / 812px */
  left: 50%;
  transform: translateX(-50%);
  width: 53%; /* 200px / 375px */
  height: 7.5%; /* 60px / 812px */
  z-index: 20;
  cursor: pointer;
  /* Transparent but clickable - covers the button area in UI */
}

.dots-indicator {
  position: absolute;
  bottom: 5%; /* Approx 40px / 812px */
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
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.dot.active {
  width: 24px;
  border-radius: 4px;
  background: rgba(255, 107, 107, 0.9);
}
</style>
