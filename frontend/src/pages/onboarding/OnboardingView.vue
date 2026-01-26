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
        跳过
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
    title: '欢迎来到 BrushBuddy',
    description: '让刷牙变得有趣，培养孩子良好的刷牙习惯'
  },
  {
    image: '/images/onboarding-slide2.png',
    title: '个性化绘本',
    description: 'AI 为您的孩子生成专属的刷牙故事绘本'
  },
  {
    image: '/images/onboarding-slide3.png',
    title: '有趣的刷牙体验',
    description: '跟着故事角色一起刷牙，2分钟不知不觉过去'
  },
  {
    image: '/images/onboarding-slide4.png',
    title: '建立刷牙习惯',
    description: '每日打卡，培养孩子终身受益的刷牙习惯'
  },
  {
    image: '/images/onboarding-slide5.png',
    title: '家长放心',
    description: '详细记录孩子的刷牙情况，让您随时了解'
  },
  {
    image: '/images/onboarding-slide6.png',
    title: '多种主题',
    description: '太空、海洋、森林等多种主题，总有孩子喜欢的'
  },
  {
    image: '/images/onboarding-slide7.png',
    title: 'AI 智能生成',
    description: '上传照片，AI 自动生成孩子专属的卡通角色'
  },
  {
    image: '/images/onboarding-slide8.png',
    title: '隐私安全',
    description: '所有数据加密存储，保护孩子的隐私安全'
  },
  {
    image: '/images/onboarding-slide9.png',
    title: '立即开始',
    description: '创建第一个绘本，开启刷牙冒险之旅！'
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
  router.push('/')
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
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
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
  bottom: 10%; /* Approx 80px / 812px */
  left: 50%;
  transform: translateX(-50%);
  width: 53%; /* 200px / 375px */
  height: 7.5%; /* 60px / 812px */
  z-index: 20;
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
  top: 2.5%; /* Approx 20px / 812px */
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
